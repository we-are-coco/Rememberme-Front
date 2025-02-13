import {Box} from "@/src/components/ui/box";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {Text} from "@/src/components/ui/text";
import React, {useEffect, useState} from "react";
import {getToken, removeToken} from "@/src/services/AuthService";
import {getCategoryList, getUser} from "@/src/api/api";
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
import {ChevronDownIcon} from "@/src/components/ui/icon";
import {Input, InputField} from "@/src/components/ui/input";
import {Textarea, TextareaInput} from "@/src/components/ui/textarea";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {Category, FormData, AlertForm, Item} from "@/src/utils/interfaceCase";

const Detail = (item: Item) => {
    const navigation = useNavigation();
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [categoryList, setCategoryList] = useState<Category[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(item.category_id);
    const [formData, setFormData] = useState<FormData>({
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
        // noinspection JSIgnoredPromiseFromCall
        fetchToken();
        // noinspection JSIgnoredPromiseFromCall
        loadCategoryList();
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
                    쿠폰/티켓 등록
                </Text>
            </Box>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} className={"flex-shrink"}>
                <Box className={"items-center justify-center p-6"}>
                    <Image
                        source={{
                            uri: item.url,
                        }}
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
                            defaultValue={categoryList?.find(item => item.id === selectedCategory)?.name}
                        >
                            <SelectTrigger>
                                <SelectInput placeholder={"카테고리를 선택하세요."} className={"flex-1"}/>
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
                                    defaultValue={formData.date}
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
                                    defaultValue={formData.time}
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
                            />
                        </Textarea>
                    </FormControl>
                </VStack>
            </ScrollView>

            {/* Footer */}
            <HStack space={"md"} className={"border-t"} style={{borderColor: "#ffaa00"}}>
                <Pressable
                    className={"flex-1 items-center justify-center bg-custom-orange p-4"}
                >
                    <Text style={{color: "white"}} bold size={"3xl"}>저장</Text>
                </Pressable>
            </HStack>

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

export default Detail;