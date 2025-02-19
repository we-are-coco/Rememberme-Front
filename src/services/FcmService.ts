import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { sendFCMTokenToBackend } from "@/src/api/api";
import { getToken } from "@/src/services/AuthService";

// 🔹 알림 핸들러 설정 (앱이 실행 중일 때 알림을 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림을 화면에 표시
    shouldPlaySound: true, // 소리 재생
    shouldSetBadge: false, // 배지 표시 안 함
  }),
});

let isBackgroundHandlerSet = false; // 백그라운드 핸들러 등록 여부

// 🔹 알림 권한 요청 및 FCM 토큰 가져오기
export const initializeFCM = async () => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("❌ FCM 초기화 중단: 알림 권한 없음.");
      return;
    }
    // 🔥 FCM 토큰 가져오기
    const fcmToken = await getFCMToken();
    if (fcmToken) {
      // FCM 토큰을 서버로 전송
      await sendFCMTokenToBackend(fcmToken);
    }
    // ✅ 푸시 알림 리스너 & 백그라운드 핸들러 등록
    setupNotificationListeners();
    if (!isBackgroundHandlerSet) {
      // 백그라운드 핸들러는 처음 한 번만 실행되면 됨
      setupBackgroundNotificationHandler();
    }
  } catch (error) {
    console.error("❌ FCM 토큰 가져오기 실패:", error);
  }

  // Android에서는 알림 채널을 설정해야 함
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH, // 높은 중요도 설정
      vibrationPattern: [0, 250, 250, 250], // 진동 패턴
      lightColor: "#FF231F7C", // 알림 불빛 색상
    });
  }
};

// 권한 요청 함수
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log("❌ 실제 기기에서만 푸시 알림을 사용할 수 있습니다.");
    return false;
  }

  const { status: currentStatus } = await Notifications.getPermissionsAsync();
  if (currentStatus === "granted") {
    console.log("✅ 알림 권한이 이미 허용됨.");
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("❌ 알림 권한이 거부되었습니다.");
    return false;
  }

  console.log("🔑 알림 권한이 새로 허용되었습니다.");
  return true;
};

/**
 * 📌 FCM 토큰 가져오는 함수
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const authToken = await getToken(); // 로그인된 사용자 토큰 확인
    if (authToken) {
      const fcmToken = await messaging().getToken();
      console.log("🔥 [getFCMToken] FCM 토큰:", fcmToken);
      return fcmToken;
    } else {
      console.log("🔹 로그인되지 않음: FCM 토큰을 서버로 보내지 않음.");
      return null;
    }
  } catch (error) {
    console.error("❌ [getFCMToken] FCM 토큰 가져오기 실패:", error);
    return null;
  }
};

let messageListener: (() => void) | null = null; // 기존 리스너 저장 변수

export const setupNotificationListeners = () => {
  if (messageListener) {
    messageListener(); // 기존 리스너 제거
  }

  messageListener = messaging().onMessage(async (remoteMessage) => {
    console.log("📩 FCM 푸시 알림 수신:", remoteMessage);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || "새로운 알림",
        body: remoteMessage.notification?.body || "푸시 알림이 도착했습니다.",
        sound: "default",
      },
      trigger: null, // 즉시 표시
    });
  });

  // 🔥 사용자가 알림을 클릭했을 때 실행
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("📲 사용자가 푸시 알림을 클릭함:", response);
  });
};

// 📌 백그라운드 및 종료 상태에서 푸시 알림을 처리하는 핸들러
export const setupBackgroundNotificationHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("📩 [백그라운드] FCM 메시지 수신:", remoteMessage);
  });

  isBackgroundHandlerSet = true; // 등록 완료 플래그 설정
};
