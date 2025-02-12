import {Box} from "@/src/components/ui/box";
import {Text} from "@/src/components/ui/text";
import {Button} from "@/src/components/ui/button";
import React, {useEffect} from "react";
import {useNavigation} from "@react-navigation/native";
import {Image} from "react-native";
import {getToken} from "@/src/services/AuthService";

const Start = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await getToken();
            if (storedToken) {
                // @ts-ignore
                navigation.navigate("Home");
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchToken();
    }, []);

    return (
        <Box className={"flex-1 justify-center items-center bg-custom-beige p-6"}>
            <Image
                source={require("../../assets/image/coco-icon.png")}
                resizeMode={"contain"}
            />
            <Button
                className={"w-11/12 h-16 rounded-lg justify-center items-center mb-4"}
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate("Register");
                }}
            >
                <Text bold className={"text-typography-0 text-2xl"}>시작하기</Text>
            </Button>
            <Text className={"text-xl"}>
                이미 계정이 있나요?{' '}
                <Text
                    style={{color: "#ffaa00"}}
                    bold
                    className={"text-xl"}
                    onPress={() => {
                        // @ts-ignore
                        navigation.navigate("Login");
                    }}
                >
                    로그인
                </Text>
            </Text>
        </Box>
    );
};

export default Start;