import React, {useEffect} from "react";
import {Box} from "@/src/components/ui/box";
import {VStack} from "@/src/components/ui/vstack";
import {Button, ButtonText} from "@/src/components/ui/button";
import {HStack} from "@/src/components/ui/hstack";
import {Ionicons} from "@expo/vector-icons";
import {Text} from "@/src/components/ui/text";
import {Pressable} from "@/src/components/ui/pressable";
import {Divider} from "@/src/components/ui/divider";
import {ScrollView} from "react-native";
import {getToken} from "@/src/services/AuthService";

const Settings = () => {
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
                            <Text size={"2xl"} bold={true}>유저 이름</Text>
                            <Button
                                size="xl"
                                className={"rounded-full"}
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
                            <Ionicons name="notifications-outline" size={24} color="black"/>
                            <Text size={"lg"} bold={true}>유효기간 만료알림 설정</Text>
                        </HStack>
                        {/* 알림 설정 */}
                        <Pressable
                            className={"p-6 bg-background-100 rounded-md"}
                            onPress={() => {
                                alert("text")
                            }}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <Text size={"xl"} bold={true}>5일전 오전 9시</Text>
                                <Pressable
                                    onPress={() => {
                                        alert("삭제")
                                    }}
                                >
                                    <Ionicons name={"trash-outline"} size={24} color={"gray"}/>
                                </Pressable>
                            </HStack>
                        </Pressable>
                        <Divider className="my-0.5"/>
                        {/* 알림 추가 */}
                        <Pressable
                            className={"bg-white flex items-center justify-center p-2"}
                            onPress={() => {
                                alert("추가")
                            }}
                        >
                            <Text size={"xl"} bold={true}>+ 알림 추가</Text>
                        </Pressable>
                    </VStack>
                </Box>

                {/* 기타 설정 */}
                <Box className={"p-4 bg-white"}>
                    <VStack space={"md"}>
                        <Pressable
                            className={"bg-white p-2"}
                            onPress={() => {
                                alert("기기내 쿠폰 일괄등록")
                            }}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"lg"}>
                                    <Ionicons name="images-outline" size={24} color="black"/>
                                    <Text size={"xl"} bold={true}>기기내 쿠폰 일괄등록</Text>
                                </HStack>
                                <Ionicons name="chevron-forward" size={24} color="black"/>
                            </HStack>
                        </Pressable>
                        <Pressable
                            className={"bg-white p-2"}
                            onPress={() => {
                                alert("사용완료/기간만료 데이터 삭제")
                            }}
                        >
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"lg"}>
                                    <Ionicons name="trash-bin-outline" size={24} color="black"/>
                                    <Text size={"xl"} bold={true}>사용완료/기간만료 데이터 삭제</Text>
                                </HStack>
                                <Ionicons name="chevron-forward" size={24} color="black"/>
                            </HStack>
                        </Pressable>
                    </VStack>
                </Box>
            </VStack>
        </ScrollView>
    );
};

export default Settings;