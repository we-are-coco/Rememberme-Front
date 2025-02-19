import {Box} from "@/src/components/ui/box";
import React, {useState} from "react";
import {Image} from "@/src/components/ui/image";
import {ScrollView} from "react-native";
import {VStack} from "@/src/components/ui/vstack";
import {FormControl, FormControlLabel, FormControlLabelText} from "@/src/components/ui/form-control";
import {Input, InputField} from "@/src/components/ui/input";
import {useNavigation} from "@react-navigation/native";
import {Button, ButtonText} from "@/src/components/ui/button";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/src/components/ui/alert-dialog";
import {Heading} from "@/src/components/ui/heading";
import {Text} from "@/src/components/ui/text";
import {login} from "@/src/api/api";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {LoginForm, AlertForm} from "@/src/utils/interfaceCase";

const Login = () => {
    const navigation = useNavigation();
    const [loginForm, setLoginForm] = useState<LoginForm>({
        email: "",
        password: "",
    });
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);

    const handleChangeForm = (field: string, value: string) => {
        setLoginForm(prevState => ({...prevState, [field]: value}));
    };

    const handleSubmit = async () => {
        const responseData = await login(loginForm);

        if (responseData === "success") {
            // @ts-ignore
            navigation.reset({
                index: 0,
                // @ts-ignore
                routes: [{name: "Home"}]
            });
        } else if (responseData === "fail") {
            setAlertForm({
                title: "로그인 실패",
                content: "아이디 또는 비밀번호를 확인해주세요.",
                showCancel: false,
                submit: null
            });
        } else {
            setAlertForm({
                title: "로그인 실패",
                content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
                showCancel: false,
                submit: null
            });
        }
        setShowAlert(true);
    };

    return (
        <Box className={"flex-1 justify-center items-center bg-white"}>
            <Pressable
                className={"absolute top-5 left-5 bg-white bg-opacity-50 p-4 rounded-full"}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name={"arrow-back"} size={24} color={"black"}/>
            </Pressable>
            <Box className={"flex justify-center items-end"} style={{paddingTop: 20}}>
                <Box style={{paddingRight: 40}}>
                    <Image
                        source={require("../../assets/image/nutty-no-bg.png")}
                        alt={"nutty-no-bg"}
                        size={"xl"}
                    />
                </Box>
                <Box style={{paddingLeft: 40, paddingRight: 40}}>
                    <Image
                        source={require("../../assets/image/rememberme.png")}
                        className={"w-screen"}
                        alt={"regist_img"}
                        resizeMode={"contain"}
                    />
                </Box>
            </Box>
            <ScrollView showsVerticalScrollIndicator={false}
                        className={"flex-shrink w-full p-6"}
                        style={{marginBottom: 20}}
            >
                <VStack space={"md"} className={"w-full p-6"}>
                    <FormControl
                        className={"w-full"}
                    >
                        <FormControlLabel>
                            <FormControlLabelText>이메일</FormControlLabelText>
                        </FormControlLabel>
                        <Input className={"rounded-full"} size={"xl"}>
                            <InputField
                                type={"text"}
                                onChangeText={(email) => {
                                    handleChangeForm("email", email);
                                }}
                            />
                        </Input>
                    </FormControl>
                    <FormControl
                        className={"w-full"}
                    >
                        <FormControlLabel>
                            <FormControlLabelText>비밀번호</FormControlLabelText>
                        </FormControlLabel>
                        <Input className={"rounded-full"} size={"xl"}>
                            <InputField
                                type={"password"}
                                onChangeText={(password) => {
                                    handleChangeForm("password", password);
                                }}
                            />
                        </Input>
                    </FormControl>
                    <Button className={"w-full self-end mt-4 rounded-full"} size={"xl"} onPress={handleSubmit}>
                        <ButtonText size={"xl"}>로그인</ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
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
        </Box>
    );
};

export default Login;