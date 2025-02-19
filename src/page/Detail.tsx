import {Box} from "@/src/components/ui/box";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {Text} from "@/src/components/ui/text";
import React, {useEffect, useState} from "react";
import {getToken, removeToken} from "@/src/services/AuthService";
import {deleteImage as deleteImageApi, getCategoryList, getImage, getUser, updateImage, isUsedUpdate} from "@/src/api/api";
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
import {Button, ButtonText} from "@/src/components/ui/button";
import {HStack} from "@/src/components/ui/hstack";
import {ScrollView} from "react-native";
import {Image} from "@/src/components/ui/image";
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
    SelectTrigger
} from "@/src/components/ui/select";
import {CheckIcon, ChevronDownIcon} from "@/src/components/ui/icon";
import {Input, InputField} from "@/src/components/ui/input";
import {Textarea, TextareaInput} from "@/src/components/ui/textarea";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {AlertForm, Category, Item} from "@/src/utils/interfaceCase";
import {Spinner} from "@/src/components/ui/spinner";
import colors from "tailwindcss/colors";
import {Switch} from "@/src/components/ui/switch";
import {Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel} from "@/src/components/ui/checkbox";

const Detail = (item: Item) => {
    const navigation = useNavigation();
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [categoryList, setCategoryList] = useState<Category[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(item.category_id);
    const [formData, setFormData] = useState<Item>({
        id: "",
        user_id: "",
        title: "",
        category_id: "",
        description: "",
        brand: "",
        type: "",
        url: "",
        date: "",
        time: "",
        from_location: "",
        to_location: "",
        location: "",
        details: "",
        start_date: "",
        end_date: "",
        code: "",
        created_at: "",
        updated_at: "",
        is_used: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isAlarm, setIsAlarm] = useState(false);
    const [alarms, setAlarms] = useState<string[]>([]);

    const handleChangeCategory = (category: string) => {
        setSelectedCategory(category);
        setFormData(prevState => ({...prevState, category_id: category}));
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
        const newDate = new Date(`${date}T${time}:00.000Z`);
        switch (unit) {
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

    const completeContent = async () => {
        setIsLoading(true);
        const responseData = await isUsedUpdate(formData.id, !formData.is_used);

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
        } else if (responseData) {
            setAlertForm({
                title: "저장 성공",
                content: "사용완료/취소 되었습니다.",
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
        } else {
            setAlertForm({
                title: "처리 실패",
                content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
                showCancel: false,
                submit: null,
            });
            setShowAlert(true);
        }
        setIsLoading(false);
    };

    const saveContent = async () => {
        setIsLoading(true);
        let sendData = {...formData, notifications: [] as string[]};
        if (isAlarm && alarms.length > 0) {
            let notifications = [];
            for (let i = 0; i < alarms.length; i++) {
                switch (alarms[i]) {
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

        const responseData = await updateImage(replaceData);
        setIsLoading(false);
        if (responseData === 200) {
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

    const deleteConfirm = (id: string) => {
        setAlertForm({
            title: "삭제 여부 확인",
            content: "정말 삭제하시겠습니까?",
            showCancel: true,
            submit: () => {
                // noinspection JSIgnoredPromiseFromCall
                deleteImage(id);
            },
        });
        setShowAlert(true);
    };

    const deleteImage = async (id: string) => {
        const responseData = await deleteImageApi(id);
        if (responseData === 204) {
            setAlertForm({
                title: "삭제 성공",
                content: "삭제 되었습니다.",
                showCancel: false,
                submit: async () => {
                    // @ts-ignore
                    navigation.reset({
                        index: 0,
                        // @ts-ignore
                        routes: [{name: "Home"}]
                    });
                },
            });
            setShowAlert(true);
        } else if (responseData === 401) {
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
                title: "삭제 실패",
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
        };
        const fetchItem = async (id: string) => {
            const responseData = await getImage(id);

            if (responseData === null) {
                setAlertForm({
                    title: "로드 실패",
                    content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
                    showCancel: false,
                    submit: () => {
                        // @ts-ignore
                        navigation.reset({
                            index: 0,
                            // @ts-ignore
                            routes: [{name: "Home"}]
                        });
                    },
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
                // @ts-ignore
                const receiveData: Item = responseData;
                console.log(`[Loaded Item]: `, receiveData);
                setFormData(prevState => ({...prevState, ...receiveData}));
                if (receiveData.notifications && receiveData.notifications.length > 0) {
                    for (let i = 0; i < receiveData.notifications.length; i++) {
                        const referenceDate = new Date(`${receiveData.date}T${receiveData.time}`);
                        // @ts-ignore
                        const targetDate = new Date(receiveData.notifications[i].notification_time);

                        const oneMonthBefore = new Date(referenceDate);
                        oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

                        const oneWeekBefore = new Date(referenceDate);
                        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

                        const threeDaysBefore = new Date(referenceDate);
                        threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

                        const oneDayBefore = new Date(referenceDate);
                        oneDayBefore.setDate(oneDayBefore.getDate() - 1);

                        const threeHoursBefore = new Date(referenceDate);
                        threeHoursBefore.setHours(threeHoursBefore.getHours() - 3);

                        const oneHourBefore = new Date(referenceDate);
                        oneHourBefore.setHours(oneHourBefore.getHours() - 1);

                        const checkTimeDifference = () => {
                            if (targetDate.getTime() === oneMonthBefore.getTime()) {
                                setAlarms((prev) => [...prev, "1month"]);
                            } else if (targetDate.getTime() === oneWeekBefore.getTime()) {
                                setAlarms((prev) => [...prev, "1week"]);
                            } else if (targetDate.getTime() === threeDaysBefore.getTime()) {
                                setAlarms((prev) => [...prev, "3day"]);
                            } else if (targetDate.getTime() === oneDayBefore.getTime()) {
                                setAlarms((prev) => [...prev, "1day"]);
                            } else if (targetDate.getTime() === threeHoursBefore.getTime()) {
                                setAlarms((prev) => [...prev, "3hour"]);
                            } else if (targetDate.getTime() === oneHourBefore.getTime()) {
                                setAlarms((prev) => [...prev, "1hour"]);
                            }
                        };

                        checkTimeDifference();
                    }
                    setIsAlarm(true);
                }
            }
        };

        // @ts-ignore
        if (!item.route.params.item) {
            setAlertForm({
                title: "데이터 로드 실패",
                content: "존재하지 않는 데이터 입니다.",
                showCancel: false,
                submit: () => {
                    // @ts-ignore
                    navigation.reset({
                        index: 0,
                        // @ts-ignore
                        routes: [{name: "Home"}]
                    });
                },
            });
            setShowAlert(true);
            return;
        } else {
            // @ts-ignore
            const propsItem = item.route.params.item;
            setSelectedCategory(propsItem.category_id);
            // noinspection JSIgnoredPromiseFromCall
            fetchToken();
            // noinspection JSIgnoredPromiseFromCall
            loadCategoryList();
            // noinspection JSIgnoredPromiseFromCall
            fetchItem(propsItem.id);
        }
    }, []);

    return (
        <Box className={"bg-white flex-1"}>
            {/* Header */}
            <Box className={"flex-row items-center p-4"}>
                <Pressable
                    style={{paddingRight: 20}}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name={"arrow-back"} size={24} color={"black"}/>
                </Pressable>
                <Text size={"2xl"} bold={true}>
                    쿠폰/티켓 상세
                </Text>
            </Box>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} className={"flex-shrink"}>
                <Box className={"items-center justify-center p-6"}>
                    <Image
                        source={{uri: `${formData.url}?sv=2022-11-02&ss=b&srt=o&sp=r&se=2025-02-28T10:19:22Z&st=2025-02-14T02:19:22Z&spr=https&sig=eGOeTigdul7Kd8%2BXnz3XpR6DfNM1vQYwXowhmsTbvqk%3D`}}
                        alt={"image"}
                        size={"2xl"}
                        resizeMode={"contain"}
                    />
                    {
                        ((new Date(formData.date + "T" + formData.time)) < (new Date()) || formData.is_used) && (
                            <HStack
                                space={"sm"}
                                className={"flex-1 items-center justify-center"}
                                style={{marginTop: 10}}
                            >
                                <Ionicons name={"warning-outline"} size={18} color={"gray"}/>
                                <Text style={{color: "gray"}}>
                                    {
                                        (new Date(formData.date + "T" + formData.time)) < (new Date()) ?
                                            "만료된 데이터입니다."
                                            : "사용 완료된 데이터입니다."
                                    }
                                </Text>
                            </HStack>
                        )
                    }
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
                                    className={"flex-1"}/>
                                <SelectIcon className={"mr-3"} as={ChevronDownIcon}
                                />
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
            </ScrollView>

            {/* Footer */}
            <VStack space={"xs"}>
                <HStack space={"md"}>
                    <Pressable
                        className={"flex-1 items-center justify-center bg-custom-orange p-4"}
                        disabled={saveDisabledCheck()}
                        onPress={saveContent}
                    >
                        <Text style={{color: "white"}} bold size={"3xl"}>변경사항 저장</Text>
                    </Pressable>
                </HStack>
                <HStack>
                    <Pressable
                        className={"flex-1 items-center justify-center bg-custom-beige p-4"}
                        onPress={completeContent}
                    >
                        <Text style={{color: "black"}} bold size={"3xl"}>
                            {formData.is_used ? "사용 완료 취소" : "사용 완료"}
                        </Text>
                    </Pressable>
                    <Pressable
                        className={"flex-1 items-center justify-center bg-custom-red p-4"}
                        onPress={() => deleteConfirm(formData.id)}
                    >
                        <Text style={{color: "white"}} bold size={"3xl"}>삭제</Text>
                    </Pressable>
                </HStack>
            </VStack>

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

export default Detail;