import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { sendFCMTokenToBackend } from "@/src/api/api";

// 🔹 알림 핸들러 설정 (앱이 실행 중일 때 알림을 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림을 화면에 표시
    shouldPlaySound: true, // 소리 재생
    shouldSetBadge: false, // 배지 표시 안 함
  }),
});

// 🔹 알림 권한 요청 및 FCM 토큰 가져오기
export const initializeFCM = async () => {
  if (!Device.isDevice) {
    console.log("❌ 실제 기기에서만 푸시 알림을 사용할 수 있습니다.");
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("❌ 알림 권한이 거부되었습니다.");
    return;
  }
  console.log("🔑 알림 권한이 허용되었습니다.");

  try {
    // 🔥 FCM 토큰 가져오기
    const fcmToken = await messaging().getToken();
    console.log("🔥 FCM 토큰:", fcmToken); // 이 토큰을 서버에 저장해야 푸시 알림이 정상적으로 수신됨
    if (fcmToken) {
      // FCM 토큰을 서버로 전송
      await sendFCMTokenToBackend(fcmToken);
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

// 📌 푸시 알림 리스너 설정
export const setupNotificationListeners = () => {
  // ✅ 앱이 실행 중일 때(Foreground) 푸시 알림 표시
  messaging().onMessage(async (remoteMessage) => {
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
};
