import React, {useEffect, useState} from "react";
import {Box} from "@/src/components/ui/box";
import {VStack} from "@/src/components/ui/vstack";
import {Button, ButtonText} from "@/src/components/ui/button";
import {HStack} from "@/src/components/ui/hstack";
import {Ionicons} from "@expo/vector-icons";
import {Text} from "@/src/components/ui/text";
import {Pressable} from "@/src/components/ui/pressable";
import {Divider} from "@/src/components/ui/divider";
import {ScrollView} from "react-native";
import {getToken, removeToken} from "@/src/services/AuthService";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/src/components/ui/alert-dialog";
import {Heading} from "@/src/components/ui/heading";
import {useNavigation} from "@react-navigation/native";
import {getUser, deleteUser} from "@/src/api/api";
import {AlertForm, UserData} from "@/src/utils/interfaceCase";
import {Spinner} from "@/src/components/ui/spinner";
import colors from "tailwindcss/colors";

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
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
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
                    routes: [{name: "Start"}]
                });
            },
        });
        setShowAlert(true);
    };

    const deleteConfirm = (id: string) => {
        setAlertForm({
            title: "탈퇴 여부 확인",
            content: "정말 탈퇴하시겠습니까?",
            showCancel: true,
            submit: () => {
                // noinspection JSIgnoredPromiseFromCall
                handleDeleteUser();
            },
        });
        setShowAlert(true);
    };

    const handleDeleteUser = async () => {
        setIsLoading(true);
        const responseData = await deleteUser();
        setIsLoading(false);
        if (responseData === 401) {
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
                        routes: [{name: "Start"}]
                    });
                },
            });
            setShowAlert(true);
        } else if (responseData === 204) {
            await removeToken();
            setAlertForm({
                title: "회원 탈퇴 완료",
                content: "회원 탈퇴 되었습니다. 시작 화면으로 돌아갑니다.",
                showCancel: false,
                submit: () => {
                    // @ts-ignore
                    navigation.reset({
                        index: 0,
                        // @ts-ignore
                        routes: [{name: "Start"}]
                    });
                },
            });
            setShowAlert(true);
        } else {
            setAlertForm({
                title: "회원 탈퇴 실패",
                content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
                showCancel: false,
                submit: null,
            });
            setShowAlert(true);
        }
    };

    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await getToken();
            if (!storedToken) {
                // @ts-ignore
                navigation.reset({
                    index: 0,
                    // @ts-ignore
                    routes: [{name: "Start"}]
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
                                routes: [{name: "Start"}]
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
                            alert("text")
                        }}
                    >
                        <HStack className={"flex items-center justify-between"}>
                            <Text size={"2xl"} bold={true}>{userData.name} 님 환영합니다!</Text>
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
                {/*<Box className={"mb-4 p-4 bg-white"}>*/}
                {/*    <VStack space={"lg"}>*/}
                {/*        /!* 타이틀 *!/*/}
                {/*        <HStack space={"lg"}>*/}
                {/*            <Ionicons name={"notifications-outline"} size={24} color={"black"}/>*/}
                {/*            <Text size={"lg"} bold={true}>유효기간 만료알림 설정</Text>*/}
                {/*        </HStack>*/}
                {/*        /!* 알림 설정 *!/*/}
                {/*        <Pressable*/}
                {/*            className={"p-6 bg-background-100 rounded-md"}*/}
                {/*            onPress={() => {*/}
                {/*                alert("text")*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            <HStack className={"flex items-center justify-between"}>*/}
                {/*                <Text size={"xl"} bold={true}>5일전 오전 9시</Text>*/}
                {/*                <Pressable*/}
                {/*                    onPress={() => {*/}
                {/*                        alert("삭제")*/}
                {/*                    }}*/}
                {/*                >*/}
                {/*                    <Ionicons name={"trash-outline"} size={24} color={"gray"}/>*/}
                {/*                </Pressable>*/}
                {/*            </HStack>*/}
                {/*        </Pressable>*/}
                {/*        <Divider className={"my-0.5"}/>*/}
                {/*        /!* 알림 추가 *!/*/}
                {/*        <Pressable*/}
                {/*            className={"bg-white flex items-center justify-center p-2"}*/}
                {/*            onPress={() => {*/}
                {/*                alert("추가")*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            <Text size={"xl"} bold={true}>+ 알림 추가</Text>*/}
                {/*        </Pressable>*/}
                {/*    </VStack>*/}
                {/*</Box>*/}

                {/* 기타 설정 */}
                <Box className={"p-4 bg-white"}>
                    <VStack space={"md"}>
                        <Pressable
                            className={"bg-white p-2"}
                            onPress={() => {
                                // @ts-ignore
                                navigation.navigate("Dispose");
                            }}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"lg"}>
                                    <Ionicons name={"trash-bin-outline"} size={24} color={"black"}/>
                                    <Text size={"xl"} bold={true}>사용완료/기간만료 데이터</Text>
                                </HStack>
                                <Ionicons name={"chevron-forward"} size={24} color={"black"}/>
                            </HStack>
                        </Pressable>
                        <Pressable
                            className={"bg-white p-2"}
                            onPress={() => {
                                setAlertForm({
                                    title: "기기내 쿠폰 일괄등록",
                                    content: "준비 중인 기능입니다.",
                                    showCancel: false,
                                    submit: null
                                });
                                setShowAlert(true);
                            }}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"lg"}>
                                    <Ionicons name={"images-outline"} size={24} color={"black"}/>
                                    <Text size={"xl"} bold={true}>기기내 쿠폰 일괄등록</Text>
                                </HStack>
                                <Ionicons name={"chevron-forward"} size={24} color={"black"}/>
                            </HStack>
                        </Pressable>
                        <Pressable
                            className={"bg-white p-2"}
                            style={{marginTop: 20}}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"lg"}>
                                    <Ionicons name={"construct"} size={24} color={"black"}/>
                                    <Text size={"xl"} bold={true}>더 다양하고 새로운 기능들이 추가될 예정입니다.</Text>
                                </HStack>
                            </HStack>
                        </Pressable>
                    </VStack>
                </Box>
                <Pressable
                    className={"p-4"}
                    onPress={() => {
                        // @ts-ignore
                        deleteConfirm();
                    }}
                >
                    <Text style={{color: "#ffaa00", textDecorationLine: "underline"}}>탈퇴하기</Text>
                </Pressable>
            </VStack>
            <AlertDialog
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                }}
                size={"md"}
            >
                <AlertDialogBackdrop/>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className={"text-typography-950 font-semibold"} size={"md"}>
                            {alertForm.title}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className={"mt-3 mb-4"}>
                        <Text size={"sm"}>
                            {alertForm.content}
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        {
                            alertForm.showCancel && (
                                <Button
                                    variant={"outline"}
                                    action={"secondary"}
                                    onPress={() => setShowAlert(false)}
                                    size={"sm"}
                                >
                                    <ButtonText>취소</ButtonText>
                                </Button>
                            )
                        }
                        <Button
                            variant={"outline"}
                            action={"primary"}
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

            {/* Spinner */}
            {
                isLoading && (
                    <Box className={"absolute w-full h-full"}>
                        <Box className={"w-full h-full"} style={{opacity: 0.3, backgroundColor: "black"}}/>
                        <Spinner size={"large"} color={colors.amber[600]} className={"absolute w-full h-full"}/>
                    </Box>
                )
            }
        </ScrollView>
    );
};

export default Settings;