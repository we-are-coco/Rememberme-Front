import React, { useEffect, useState } from "react";
import { Box } from "@/src/components/ui/box";
import { VStack } from "@/src/components/ui/vstack";
import { Button, ButtonText } from "@/src/components/ui/button";
import { HStack } from "@/src/components/ui/hstack";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/src/components/ui/text";
import { Pressable } from "@/src/components/ui/pressable";
import { Divider } from "@/src/components/ui/divider";
import { ScrollView } from "react-native";
import { getToken, removeToken } from "@/src/services/AuthService";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/src/components/ui/alert-dialog";
import { Heading } from "@/src/components/ui/heading";
import { useNavigation } from "@react-navigation/native";
import { getUser } from "@/src/api/api";
import { UserData, AlertForm } from "@/src/utils/interfaceCase";
import { deleteFCMToken } from "@/src/services/FcmService";

const Settings = () => {
  const navigation = useNavigation();
  const [alertForm, setAlertForm] = useState<AlertForm>({
    title: "",
    content: "",
    showCancel: false,
    submit: null,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    email: "",
  });

  const handleLogout = async () => {
    await deleteFCMToken();
    await removeToken();
    setAlertForm({
      title: "로그아웃",
      content: "로그아웃 되었습니다. 시작화면으로 돌아갑니다.",
      showCancel: false,
      submit: () => {
        // @ts-ignore
        navigation.reset({
          index: 0,
          // @ts-ignore
          routes: [{ name: "Start" }],
        });
      },
    });
    setShowAlert(true);
  };

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getToken();
      if (!storedToken) {
        // @ts-ignore
        navigation.reset({
          index: 0,
          // @ts-ignore
          routes: [{ name: "Start" }],
        });
      } else {
        const responseData = await getUser();

        if (responseData === "error") {
          await removeToken();
          setAlertForm({
            title: "사용자 인증 실패",
            content: "다시 로그인 해주세요.",
            showCancel: false,
            submit: () => {
              // @ts-ignore
              navigation.reset({
                index: 0,
                // @ts-ignore
                routes: [{ name: "Start" }],
              });
            },
          });
          setShowAlert(true);
        } else {
          setUserData({
            id: responseData.id,
            name: responseData.name,
            email: responseData.email,
          });
        }
      }
    };
    // noinspection JSIgnoredPromiseFromCall
    fetchToken();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} className={"flex-shrink"}>
      <VStack space={"xs"} reversed={false}>
        {/* 사용자 정보 */}
        <Box className={"mb-4 p-4 bg-white"}>
          <Pressable
            className={"p-6 bg-background-100 rounded-md"}
            onPress={() => {
              alert("text");
            }}
          >
            <HStack className={"flex items-center justify-between"}>
              <Text size={"2xl"} bold={true}>
                {userData.name}
              </Text>
              <Button
                size={"xl"}
                className={"rounded-full"}
                onPress={handleLogout}
              >
                <ButtonText>로그아웃</ButtonText>
              </Button>
            </HStack>
          </Pressable>
        </Box>

        {/* 유효기간 만료알림 설정 */}
        <Box className={"mb-4 p-4 bg-white"}>
          <VStack space={"lg"}>
            {/* 타이틀 */}
            <HStack space={"lg"}>
              <Ionicons
                name={"notifications-outline"}
                size={24}
                color={"black"}
              />
              <Text size={"lg"} bold={true}>
                유효기간 만료알림 설정
              </Text>
            </HStack>
            {/* 알림 설정 */}
            <Pressable
              className={"p-6 bg-background-100 rounded-md"}
              onPress={() => {
                alert("text");
              }}
            >
              <HStack className={"flex items-center justify-between"}>
                <Text size={"xl"} bold={true}>
                  5일전 오전 9시
                </Text>
                <Pressable
                  onPress={() => {
                    alert("삭제");
                  }}
                >
                  <Ionicons name={"trash-outline"} size={24} color={"gray"} />
                </Pressable>
              </HStack>
            </Pressable>
            <Divider className={"my-0.5"} />
            {/* 알림 추가 */}
            <Pressable
              className={"bg-white flex items-center justify-center p-2"}
              onPress={() => {
                alert("추가");
              }}
            >
              <Text size={"xl"} bold={true}>
                + 알림 추가
              </Text>
            </Pressable>
          </VStack>
        </Box>

        {/* 기타 설정 */}
        <Box className={"p-4 bg-white"}>
          <VStack space={"md"}>
            <Pressable
              className={"bg-white p-2"}
              onPress={() => {
                alert("기기내 쿠폰 일괄등록");
              }}
            >
              <HStack className={"flex items-center justify-between"}>
                <HStack space={"lg"}>
                  <Ionicons name={"images-outline"} size={24} color={"black"} />
                  <Text size={"xl"} bold={true}>
                    기기내 쿠폰 일괄등록
                  </Text>
                </HStack>
                <Ionicons name={"chevron-forward"} size={24} color={"black"} />
              </HStack>
            </Pressable>
            <Pressable
              className={"bg-white p-2"}
              onPress={() => {
                alert("사용완료/기간만료 데이터 삭제");
              }}
            >
              <HStack className={"flex items-center justify-between"}>
                <HStack space={"lg"}>
                  <Ionicons
                    name={"trash-bin-outline"}
                    size={24}
                    color={"black"}
                  />
                  <Text size={"xl"} bold={true}>
                    사용완료/기간만료 데이터 삭제
                  </Text>
                </HStack>
                <Ionicons name={"chevron-forward"} size={24} color={"black"} />
              </HStack>
            </Pressable>
          </VStack>
        </Box>
      </VStack>
      <AlertDialog
        isOpen={showAlert}
        onClose={() => {
          setShowAlert(false);
        }}
        size={"md"}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading
              className={"text-typography-950 font-semibold"}
              size={"md"}
            >
              {alertForm.title}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className={"mt-3 mb-4"}>
            <Text size={"sm"}>{alertForm.content}</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant={"outline"}
              action={"secondary"}
              onPress={() => {
                if (alertForm.submit !== null) {
                  alertForm.submit();
                }
                setShowAlert(false);
              }}
              size={"sm"}
            >
              <ButtonText>확인</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
};

export default Settings;
