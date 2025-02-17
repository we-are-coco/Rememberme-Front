import {Box} from "@/src/components/ui/box";
import React, {useEffect, useRef, useState} from "react";
import {Image} from "@/src/components/ui/image";
import {Input, InputField} from "@/src/components/ui/input";
import {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText
} from "@/src/components/ui/form-control";
import {AlertCircleIcon} from "@/src/components/ui/icon";
import {VStack} from "@/src/components/ui/vstack";
import {Pressable} from "@/src/components/ui/pressable";
import {Text} from "@/src/components/ui/text";
import {ScrollView} from "react-native";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/src/components/ui/alert-dialog";
import {Heading} from "@/src/components/ui/heading";
import {Button, ButtonText} from "@/src/components/ui/button";
import {register} from "@/src/api/api";
import {useNavigation} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import {RegisterForm, AlertForm} from "@/src/utils/interfaceCase";

const Register = () => {
    const navigation = useNavigation();
    const isFirstRender = useRef(true);
    const [emailValid, setEmailValid] = useState(false);
    const [nameValid, setNameValid] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [passwordCheckValid, setPasswordCheckValid] = useState(false);
    const [registerForm, setRegisterForm] = useState<RegisterForm>({
        email: "",
        name: "",
        password: "",
        passwordCheck: "",
    });
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);

    const handleChangeForm = (field: string, value: string) => {
        setRegisterForm(prevState => ({...prevState, [field]: value}));
    };

    const validForm = () => {
        // 이메일 유효성 검사
        if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
            setEmailValid(true);
        } else {
            setEmailValid(false);
        }

        // 닉네임 유효성 검사
        if (!/^[\uAC00-\uD7A3a-zA-Z0-9]{2,}$/.test(registerForm.name)) {
            setNameValid(true);
        } else {
            setNameValid(false);
        }

        // 비밀번호 유효성 검사
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(registerForm.password)) {
            setPasswordValid(true);
        } else {
            setPasswordValid(false);
        }

        // 비밀번호 확인 유효성 검사
        if (registerForm.password !== registerForm.passwordCheck) {
            setPasswordCheckValid(true);
        } else {
            setPasswordCheckValid(false);
        }
    };

    const handleSubmit = async () => {
        if (emailValid || nameValid || passwordValid || passwordCheckValid) {
            setAlertForm({
                title: "회원가입 실패",
                content: "입력한 값들을 다시 확인해주세요.",
                showCancel: false,
                submit: null
            });
            setShowAlert(true);
            return;
        }

        const responseData = await register(registerForm);

        if (responseData === "success") {
            setAlertForm({
                title: "회원가입 성공",
                content: "회원가입 되었습니다. 로그인 해주세요.",
                showCancel: false,
                submit: () => {
                    // @ts-ignore
                    navigation.navigate("Login");
                }
            });
        } else if (responseData === "already") {
            setAlertForm({
                title: "회원가입 실패",
                content: "이미 존재하는 이메일입니다.",
                showCancel: false,
                submit: null
            });
        } else if (responseData === "fail") {
            setAlertForm({
                title: "회원가입 실패",
                content: "입력한 값들을 다시 확인해주세요.",
                showCancel: false,
                submit: null
            });
        } else {
            setAlertForm({
                title: "회원가입 실패",
                content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
                showCancel: false,
                submit: null
            });
        }
        setShowAlert(true);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        validForm();
    }, [registerForm]);

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
                        source={require("../../assets/image/regist_img.png")}
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
                        isInvalid={emailValid}
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
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon}/>
                            <FormControlErrorText>
                                이메일 형식이 잘못 되었습니다.
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    <FormControl
                        className={"w-full"}
                        isInvalid={nameValid}
                    >
                        <FormControlLabel>
                            <FormControlLabelText>닉네임</FormControlLabelText>
                        </FormControlLabel>
                        <Input className={"rounded-full"} size={"xl"}>
                            <InputField
                                type={"text"}
                                onChangeText={(name) => {
                                    handleChangeForm("name", name);
                                }}
                            />
                        </Input>
                        <FormControlHelper>
                            <FormControlHelperText>
                                닉네임은 2글자 이상으로 한글, 영문, 숫자를 포함할 수 있습니다.
                            </FormControlHelperText>
                        </FormControlHelper>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon}/>
                            <FormControlErrorText>
                                닉네임 형식이 잘못 되었습니다.
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    <FormControl
                        className={"w-full"}
                        isInvalid={passwordValid}
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
                        <FormControlHelper>
                            <FormControlHelperText>
                                비밀번호는 8글자 이상으로 영문(대문자, 소문자), 숫자, 특수문자를 모두 포함해야 합니다.
                            </FormControlHelperText>
                        </FormControlHelper>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon}/>
                            <FormControlErrorText>
                                비밀번호 형식이 잘못 되었습니다.
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    <FormControl
                        className={"w-full"}
                        isInvalid={passwordCheckValid}
                    >
                        <FormControlLabel>
                            <FormControlLabelText>비밀번호 확인</FormControlLabelText>
                        </FormControlLabel>
                        <Input className={"rounded-full"} size={"xl"}>
                            <InputField
                                type={"password"}
                                onChangeText={(passwordCheck) => {
                                    handleChangeForm("passwordCheck", passwordCheck);
                                }}
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon}/>
                            <FormControlErrorText>
                                비밀번호가 맞지 않습니다.
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </VStack>
            </ScrollView>
            <Box className={"flex justify-center items-center p-6 w-full"}>

            </Box>
            <Pressable
                style={{backgroundColor: "orange", position: "absolute", bottom: 0}}
                className={"w-full justify-center items-center bg-white"}
                onPress={handleSubmit}
            >
                <Text size={"4xl"} style={{color: "white"}} className={"p-3"}>시작하기</Text>
            </Pressable>
            <AlertDialog
                isOpen={showAlert}
                onClose={() => {
                    setShowAlert(false);
                }}
                size="md"
            >
                <AlertDialogBackdrop/>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading className="text-typography-950 font-semibold" size="md">
                            {alertForm.title}
                        </Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody className="mt-3 mb-4">
                        <Text size="sm">
                            {alertForm.content}
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter className="">
                        <Button
                            variant="outline"
                            action="secondary"
                            onPress={() => {
                                if (alertForm.submit !== null) {
                                    alertForm.submit();
                                }
                                setShowAlert(false);
                            }}
                            size="sm"
                        >
                            <ButtonText>확인</ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
};

export default Register;