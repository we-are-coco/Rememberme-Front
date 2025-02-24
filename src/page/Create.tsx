import {Box} from "@/src/components/ui/box";
import React, {useEffect, useRef, useState} from "react";
import * as ImagePicker from "expo-image-picker";
import {useNavigation} from "@react-navigation/native";
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
import {Button, ButtonText} from "@/src/components/ui/button";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {HStack} from "@/src/components/ui/hstack";
import {Linking, Modal, ScrollView} from "react-native";
import {Image} from "@/src/components/ui/image";
import {CameraView, useCameraPermissions} from "expo-camera";
import {VStack} from "@/src/components/ui/vstack";
import {FormControl, FormControlLabel, FormControlLabelText} from "@/src/components/ui/form-control";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectTrigger,
} from "@/src/components/ui/select";
import {CheckIcon, ChevronDownIcon} from "@/src/components/ui/icon";
import {getCategoryList, getUser, saveImage, uploadImage as uploadImageApi} from "@/src/api/api";
import {Input, InputField} from "@/src/components/ui/input";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {Textarea, TextareaInput} from "@/src/components/ui/textarea";
import {getToken, removeToken} from "@/src/services/AuthService";
import {AlertForm, Category, FormData as FormDataInterface} from "@/src/utils/interfaceCase";
import {Spinner} from "@/src/components/ui/spinner";
import colors from "tailwindcss/colors";
import {Switch} from "@/src/components/ui/switch";
import {Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel} from "@/src/components/ui/checkbox";

const Create = () => {
    const navigation = useNavigation();
    const [mediaStatus, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
    const [cameraStatus, requestCameraPermission] = useCameraPermissions();
    // @ts-ignore
    const cameraRef = useRef<Camera | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [categoryList, setCategoryList] = useState<Category[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [formData, setFormData] = useState<FormDataInterface>({
        category_id: "",
        type: "",
        date: "",
        time: "",
        description: "",
        brand: "",
        title: "",
        code: "",
        from_location: "",
        to_location: "",
        location: "",
        details: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isAlarm, setIsAlarm] = useState(false);
    const [alarms, setAlarms] = useState<string[]>([]);

    const uploadImage = async () => {
        // 권한 확인
        if (!mediaStatus?.granted) {
            const permission = await requestMediaPermission();
            if (!permission.granted) {
                return null;
            }
        }

        // 이미지 업로드
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: false,
            quality: 1,
            // aspect: [1, 1]
        });

        // 이미지 업로드 취소
        if (result.canceled) {
            return null;
        }

        // 이미지 업로드 결과
        setImageUrl(result.assets[0].uri);
        await uploadServer(result.assets[0].uri);
    };

    const openCamera = async () => {
        if (!cameraStatus) {
            return;
        }
        if (cameraStatus.status !== "granted") {
            if (!cameraStatus.canAskAgain) {
                setAlertForm({
                    title: "권한 필요",
                    content: "앱 설정에서 카메라 권한을 변경해주세요.",
                    showCancel: false,
                    submit: () => {
                        Linking.openSettings();
                    },
                });
                setShowAlert(true);
            } else {
                await requestCameraPermission();
            }
        } else {
            setIsCameraOpen(true);
        }
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setImageUrl(photo.uri);
            setIsCameraOpen(false);
            await uploadServer(photo.uri);
        }
    };

    const resetForm = () => {
        setAlertForm({
            title: "초기화",
            content: "입력된 정보가 모두 초기화됩니다. 초기화 하시겠습니까?",
            showCancel: true,
            submit: () => {
                setFormData(prevState => ({
                    ...prevState,
                    type: "",
                    date: "",
                    time: "",
                    description: "",
                    brand: "",
                    title: "",
                    code: "",
                    from_location: "",
                    to_location: "",
                    location: "",
                    details: "",
                }));
                setAlarms([]);
                setIsAlarm(false);
            }
        });
        setShowAlert(true);
    };

    const handleChangeCategory = (category: string) => {
        setSelectedCategory(category);
        setFormData(prevState => ({...prevState, category_id: category}));
        setAlarms([]);
        setIsAlarm(false);
    };

    const handleChangeForm = (field: string, value: string) => {
        setFormData(prevState => ({...prevState, [field]: value}));
    };

    const showDatePicker = (mode: "date" | "time") => {
        DateTimePickerAndroid.open({
            value: new Date(),
            onChange: mode === "date" ? handleDatePicker : handleTimePicker,
            mode: mode,
            is24Hour: true,
        });
    };

    const handleDatePicker = (_event: any, selectedDate: any) => {
        const dateStr = selectedDate.toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'});
        const datePart = dateStr.split(".").map((part: string) => part.trim()).filter(Boolean).join("-");
        setFormData(prevState => ({...prevState, date: datePart}));
    };

    const handleTimePicker = (_event: any, selectedDate: any) => {
        const timePart = selectedDate.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false});
        setFormData(prevState => ({...prevState, time: timePart}));
    };

    const uploadServer = async (image: string) => {
        setIsLoading(true);
        const filename = image.split('/').pop();  // 파일명 추출
        const match = /\.(\w+)$/.exec(filename ?? '');
        const fileType = match ? `image/${match[1]}` : 'image';
        const formData = new FormData();
        formData.append("file", {uri: image, name: filename, type: fileType} as any);

        const responseData = await uploadImageApi(formData);
        if (responseData === null) {
            setAlertForm({
                title: "이미지 인식 실패",
                content: "이미지 인식에 실패했습니다. 초기화 후 재시도 하시거나, 각 항목을 직접 입력해주세요.",
                showCancel: false,
                submit: null,
            });
            setShowAlert(true);
        } else if (responseData === "401") {
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
            let replaceNull = Object.fromEntries(Object.entries(responseData).map(([key, value]) => [key, value === null || value === "null" ? "" : value]));

            if (replaceNull.date !== "" && replaceNull.time === "") {
                replaceNull.time = "23:59";
            }

            setSelectedCategory(replaceNull.category_id);
            setFormData(prevState => ({...prevState, ...replaceNull}));
        }
        setIsLoading(false);
    };

    const defaultCategory = () => {
        return categoryList?.find(item => item.id === selectedCategory)?.name;
    };

    const saveDisabledCheck = () => {
        let allowSave = false;

        if (formData.category_id === null || formData.category_id === "") {
            allowSave = true;
        }
        if (formData.date === null || formData.date === "") {
            allowSave = true;
        }
        if (formData.time === null || formData.time === "") {
            allowSave = true;
        }
        switch (categoryList?.find(item => item.id === selectedCategory)?.name) {
            case "쿠폰":
                if (formData.title === null || formData.title === "") {
                    allowSave = true;
                }
                break;
            case "교통":
                if (formData.from_location === null || formData.from_location === "") {
                    allowSave = true;
                }
                if (formData.to_location === null || formData.to_location === "") {
                    allowSave = true;
                }
                break;
            case "엔터테인먼트":
                if (formData.title === null || formData.title === "") {
                    allowSave = true;
                }
                if (formData.location === null || formData.location === "") {
                    allowSave = true;
                }
                break;
            case "약속":
                if (formData.location === null || formData.location === "") {
                    allowSave = true;
                }
                break;
        }
        if (isAlarm && alarms.length <= 0) {
            allowSave = true;
        }

        return allowSave;
    };

    const subtractTime = (date: string, time: string, unit: string, value: number): string => {
        let newDate = new Date(`${date}T${time}:00.000Z`);
        switch (unit) {
            case "minute":
                newDate = new Date();
                newDate.setMinutes(newDate.getMinutes() + value);
                break;
            case "month":
                newDate.setMonth(newDate.getMonth() - value);
                break;
            case "week":
                newDate.setDate(newDate.getDate() - value * 7);
                break;
            case "day":
                newDate.setDate(newDate.getDate() - value);
                break;
            case "hour":
                newDate.setHours(newDate.getHours() - value);
                break;
        }
        return newDate.toISOString();
    };

    const saveContent = async () => {
        setIsLoading(true);
        let sendData = {...formData, notifications: [] as string[]};
        if (isAlarm && alarms.length > 0) {
            let notifications = [];
            for (let i = 0; i < alarms.length; i++) {
                switch (alarms[i]) {
                    case "1min":
                        notifications.push(subtractTime(sendData.date, sendData.time, "minute", 1));
                        break;
                    case "1month":
                        notifications.push(subtractTime(sendData.date, sendData.time, "month", 1));
                        break;
                    case "1week":
                        notifications.push(subtractTime(sendData.date, sendData.time, "week", 1));
                        break;
                    case "3day":
                        notifications.push(subtractTime(sendData.date, sendData.time, "day", 3));
                        break;
                    case "1day":
                        notifications.push(subtractTime(sendData.date, sendData.time, "day", 1));
                        break;
                    case "3hour":
                        notifications.push(subtractTime(sendData.date, sendData.time, "hour", 3));
                        break;
                    case "1hour":
                        notifications.push(subtractTime(sendData.date, sendData.time, "hour", 1));
                        break;
                }
            }
            sendData = {...sendData, notifications: notifications};
        }
        const replaceData = Object.fromEntries(Object.entries(sendData).map(([key, value]) => [key, value === "" ? null : value]));

        const responseData = await saveImage(replaceData);
        setIsLoading(false);
        if (responseData === 201) {
            setAlertForm({
                title: "저장 성공",
                content: "저장되었습니다.",
                showCancel: false,
                submit: () => {
                    // @ts-ignore
                    navigation.reset({
                        index: 0,
                        // @ts-ignore
                        routes: [{name: "Home"}]
                    });
                }
            });
            setShowAlert(true);
        } else if (responseData === 401) {
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
            setAlertForm({
                title: "저장 실패",
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
                }
            }
        };
        const loadCategoryList = async () => {
            const responseData = await getCategoryList();

            setCategoryList(responseData);
            setSelectedCategory(responseData ? responseData[0].id : "");
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchToken();
        // noinspection JSIgnoredPromiseFromCall
        loadCategoryList();
    }, []);

    // @ts-ignore
    return (
        <Box className={"bg-white flex-1"}>
            {/* Header */}
            <Box className={"flex-row items-center p-4"}>
                <Pressable
                    style={{paddingRight: 20}}
                    onPress={() => {
                        // @ts-ignore
                        navigation.reset({
                            index: 0,
                            // @ts-ignore
                            routes: [{name: "Home"}]
                        });
                    }}
                >
                    <Ionicons name={"arrow-back"} size={24} color={"black"}/>
                </Pressable>
                <Text size={"2xl"} bold={true}>
                    쿠폰/티켓 등록
                </Text>
            </Box>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} className={"flex-shrink"}>
                {
                    imageUrl ? (
                        <Box>
                            <Box className={"items-center justify-center p-6"}>
                                <Image
                                    source={{uri: imageUrl}}
                                    alt={"image"}
                                    size={"2xl"}
                                    resizeMode={"contain"}
                                />
                                <HStack
                                    space={"sm"}
                                    className={"flex-1 items-center justify-center"}
                                    style={{marginTop: 10}}
                                >
                                    <Ionicons name={"warning-outline"} size={18} color={"gray"}/>
                                    <Text style={{color: "gray"}}>인식 결과가 정확하지 않을 수 있습니다.</Text>
                                </HStack>
                            </Box>
                            <VStack space={"md"} className={"w-full p-6"} style={{paddingLeft: 50, paddingRight: 50}}>
                                <FormControl
                                    className={"w-full"}
                                >
                                    {/* 공통 */}
                                    <FormControlLabel>
                                        <FormControlLabelText>카테고리</FormControlLabelText>
                                    </FormControlLabel>
                                    <Select
                                        onValueChange={handleChangeCategory}
                                        defaultValue={defaultCategory()}
                                    >
                                        <SelectTrigger>
                                            <SelectInput
                                                value={defaultCategory()}
                                                placeholder={"카테고리를 선택하세요."}
                                                className={"flex-1"}
                                            />
                                            <SelectIcon className={"mr-3"} as={ChevronDownIcon}/>
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop/>
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator/>
                                                </SelectDragIndicatorWrapper>
                                                {
                                                    categoryList && categoryList.map((item) => (
                                                        <SelectItem key={item.id} label={item.name} value={item.id}/>
                                                    ))
                                                }
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                </FormControl>
                                <FormControl
                                    className={"w-full"}
                                >
                                    <FormControlLabel>
                                        <FormControlLabelText>타입</FormControlLabelText>
                                    </FormControlLabel>
                                    <Input className={"rounded-full"} size={"xl"}>
                                        <InputField
                                            type={"text"}
                                            onChangeText={(type) => {
                                                handleChangeForm("type", type);
                                            }}
                                            defaultValue={formData.type}
                                        />
                                    </Input>
                                </FormControl>
                                <HStack space={"md"}>
                                    <FormControl className={"flex-1 justify-center"}>
                                        <FormControlLabel>
                                            <FormControlLabelText>날짜</FormControlLabelText>
                                        </FormControlLabel>
                                        <Input className={"rounded-full"} size={"xl"}>
                                            <InputField
                                                type={"text"}
                                                value={formData.date}
                                                onKeyPress={() => setFormData(prevState => ({...prevState}))}
                                                onPress={() => showDatePicker("date")}
                                            />
                                        </Input>
                                    </FormControl>
                                    <FormControl className={"flex-1 justify-center"}>
                                        <FormControlLabel>
                                            <FormControlLabelText>시간</FormControlLabelText>
                                        </FormControlLabel>
                                        <Input className={"rounded-full"} size={"xl"}>
                                            <InputField
                                                type={"text"}
                                                value={formData.time}
                                                onKeyPress={() => setFormData(prevState => ({...prevState}))}
                                                onPress={() => showDatePicker("time")}
                                            />
                                        </Input>
                                    </FormControl>
                                </HStack>
                                {
                                    (categoryList?.find(item => item.id === selectedCategory)?.name === "쿠폰") && (
                                        <VStack space={"md"}>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>브랜드</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(brand) => {
                                                            handleChangeForm("brand", brand);
                                                        }}
                                                        defaultValue={formData.brand}
                                                    />
                                                </Input>
                                            </FormControl>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>상품명</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(title) => {
                                                            handleChangeForm("title", title);
                                                        }}
                                                        defaultValue={formData.title}
                                                    />
                                                </Input>
                                            </FormControl>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>바코드/시리얼 번호</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(code) => {
                                                            handleChangeForm("code", code);
                                                        }}
                                                        defaultValue={formData.code}
                                                    />
                                                </Input>
                                            </FormControl>
                                        </VStack>
                                    )
                                }
                                {
                                    (categoryList?.find(item => item.id === selectedCategory)?.name === "교통") && (
                                        <VStack space={"md"}>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>출발 장소</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(from_location) => {
                                                            handleChangeForm("from_location", from_location);
                                                        }}
                                                        defaultValue={formData.from_location}
                                                    />
                                                </Input>
                                            </FormControl>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>도착 장소</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(to_location) => {
                                                            handleChangeForm("to_location", to_location);
                                                        }}
                                                        defaultValue={formData.to_location}
                                                    />
                                                </Input>
                                            </FormControl>
                                        </VStack>
                                    )
                                }
                                {
                                    (categoryList?.find(item => item.id === selectedCategory)?.name === "엔터테인먼트") && (
                                        <VStack space={"md"}>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>콘텐츠명</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(title) => {
                                                            handleChangeForm("title", title);
                                                        }}
                                                        defaultValue={formData.title}
                                                    />
                                                </Input>
                                            </FormControl>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>장소</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(location) => {
                                                            handleChangeForm("location", location);
                                                        }}
                                                        defaultValue={formData.location}
                                                    />
                                                </Input>
                                            </FormControl>
                                        </VStack>
                                    )
                                }
                                {
                                    (categoryList?.find(item => item.id === selectedCategory)?.name === "약속") && (
                                        <VStack space={"md"}>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>장소</FormControlLabelText>
                                                </FormControlLabel>
                                                <Input className={"rounded-full"} size={"xl"}>
                                                    <InputField
                                                        type={"text"}
                                                        onChangeText={(location) => {
                                                            handleChangeForm("location", location);
                                                        }}
                                                        defaultValue={formData.location}
                                                    />
                                                </Input>
                                            </FormControl>
                                            <FormControl
                                                className={"w-full"}
                                            >
                                                <FormControlLabel>
                                                    <FormControlLabelText>추가 정보</FormControlLabelText>
                                                </FormControlLabel>
                                                <Textarea
                                                    size={"lg"}
                                                    isReadOnly={false}
                                                    isInvalid={false}
                                                    isDisabled={false}
                                                >
                                                    <TextareaInput
                                                        placeholder={"추가 정보를 작성하세요."}
                                                        onChangeText={(details) => {
                                                            handleChangeForm("details", details);
                                                        }}
                                                        defaultValue={formData.details}
                                                    />
                                                </Textarea>
                                            </FormControl>
                                        </VStack>
                                    )
                                }
                                <FormControl
                                    className={"w-full"}
                                >
                                    <FormControlLabel>
                                        <FormControlLabelText>메모</FormControlLabelText>
                                    </FormControlLabel>
                                    <Textarea
                                        size={"lg"}
                                        isReadOnly={false}
                                        isInvalid={false}
                                        isDisabled={false}
                                    >
                                        <TextareaInput
                                            placeholder={"메모를 작성하세요."}
                                            onChangeText={(description) => {
                                                handleChangeForm("description", description);
                                            }}
                                            defaultValue={formData.description}
                                        />
                                    </Textarea>
                                </FormControl>
                                <FormControl
                                    className={"w-full"}
                                >
                                    <FormControlLabel>
                                        <FormControlLabelText>알람</FormControlLabelText>
                                    </FormControlLabel>
                                    <HStack className={"w-full"}>
                                        <Switch
                                            defaultValue={isAlarm}
                                            value={isAlarm}
                                            onValueChange={(value) => {
                                                setIsAlarm(value);
                                                setAlarms([]);
                                            }}
                                            trackColor={{false: colors.gray[300], true: colors.amber[300]}}
                                            thumbColor={colors.amber[500]}
                                        />
                                    </HStack>
                                </FormControl>
                                {
                                    isAlarm && (
                                        <CheckboxGroup
                                            value={alarms}
                                            onChange={(keys) => {
                                                setAlarms(keys);
                                            }}
                                        >
                                            <VStack space="md">
                                                <Checkbox value="1min">
                                                    <CheckboxIndicator>
                                                        <CheckboxIcon as={CheckIcon}/>
                                                    </CheckboxIndicator>
                                                    <CheckboxLabel>1분 후(테스트 용)</CheckboxLabel>
                                                </Checkbox>
                                                {
                                                    ["쿠폰", "기타"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="1month">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>한달 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                                {
                                                    ["쿠폰", "약속", "기타"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="1week">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>일주일 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                                {
                                                    ["쿠폰", "엔터테인먼트", "약속", "기타"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="3day">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>3일 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                                {
                                                    ["교통", "엔터테인먼트", "약속"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="1day">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>하루 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                                {
                                                    ["교통"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="3hour">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>3시간 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                                {
                                                    ["교통", "엔터테인먼트"].includes(categoryList?.find(item => item.id === selectedCategory)?.name as string) && (
                                                        <Checkbox value="1hour">
                                                            <CheckboxIndicator>
                                                                <CheckboxIcon as={CheckIcon}/>
                                                            </CheckboxIndicator>
                                                            <CheckboxLabel>1시간 전</CheckboxLabel>
                                                        </Checkbox>
                                                    )
                                                }
                                            </VStack>
                                        </CheckboxGroup>
                                    )
                                }
                            </VStack>
                        </Box>
                    ) : (
                        <HStack style={{paddingTop: 30}}>
                            <Pressable
                                className={"flex-1 items-center justify-center"}
                                onPress={uploadImage}
                            >
                                <Ionicons name={"image-outline"} size={100} color={"black"}/>
                                <Text size={"lg"}>앨범에서 불러오기</Text>
                            </Pressable>
                            <Pressable
                                className={"flex-1 items-center justify-center"}
                                onPress={openCamera}
                            >
                                <Ionicons name={"camera-outline"} size={100} color={"black"}/>
                                <Text size={"lg"}>카메라 촬영하기</Text>
                            </Pressable>
                        </HStack>
                    )
                }
            </ScrollView>

            {/* Footer */}
            <HStack space={"md"} className={"border-t"} style={{borderColor: "#ffaa00"}}>
                <Pressable
                    className={"flex-1 items-center justify-center p-4"}
                    onPress={resetForm}
                >
                    <Text bold size={"3xl"}>초기화</Text>
                </Pressable>
                <Pressable
                    className={"flex-1 items-center justify-center bg-custom-orange p-4"}
                    disabled={saveDisabledCheck()}
                    onPress={saveContent}
                >
                    <Text style={{color: "white"}} bold size={"3xl"}>저장</Text>
                </Pressable>
            </HStack>

            {/* Camera Modal */}
            <Modal visible={isCameraOpen} animationType={"slide"}>
                <Box className={"flex-1"}>
                    <CameraView
                        ref={cameraRef}
                        style={{flex: 1}}
                        facing={"back"}
                        animateShutter={true}
                    />
                    <Pressable
                        className={"absolute top-5 left-5 bg-black bg-opacity-50 p-4 rounded-full"}
                        onPress={() => setIsCameraOpen(false)}
                    >
                        <Ionicons name={"arrow-back"} size={24} color={"white"}/>
                    </Pressable>
                    <Box className={"absolute bottom-10 w-full flex-row justify-center"}>
                        <Pressable
                            className={"w-20 h-20 bg-white rounded-full items-center justify-center"}
                            onPress={takePicture}
                        >
                            <Ionicons name={"camera"} color={"black"} size={24}/>
                        </Pressable>
                    </Box>
                </Box>
            </Modal>

            {/* Alert */}
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
        </Box>
    );
};

export default Create;