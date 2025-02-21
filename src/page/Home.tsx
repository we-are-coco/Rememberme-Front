import {Text} from "@/src/components/ui/text";
import {Box} from "@/src/components/ui/box";
import {Button, ButtonText} from "@/src/components/ui/button";
import {HStack} from "@/src/components/ui/hstack";
import {FlatList, RefreshControl, ScrollView} from "react-native";
import {Input, InputField, InputIcon, InputSlot} from "@/src/components/ui/input";
import {AddIcon, ChevronDownIcon, SearchIcon} from "@/src/components/ui/icon";
import React, {useEffect, useState} from "react";
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
import {Fab, FabIcon} from "@/src/components/ui/fab";
import {VStack} from "@/src/components/ui/vstack";
import {Heading} from "@/src/components/ui/heading";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {Image} from "@/src/components/ui/image";
import {useNavigation} from "@react-navigation/native";
import {getToken, removeToken} from '../services/AuthService';
import {
    audioSearch as audioSearchApi,
    deleteImage as deleteImageApi,
    getCategoryList,
    getImageList,
    getUser
} from "@/src/api/api";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/src/components/ui/alert-dialog";
import {AlertForm, Category, Item} from "@/src/utils/interfaceCase";
import {Spinner} from "@/src/components/ui/spinner";
import colors from "tailwindcss/colors";
import {Audio} from 'expo-av';

const Home = () => {
    const navigation = useNavigation();
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [categoryList, setCategoryList] = useState<Category[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortCase, setSortCase] = useState("valid");
    const [imageList, setImageList] = useState<Item[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [showAudioAlert, setShowAudioAlert] = useState(false);

    const filteredData = (): Item[] => {
        let filtering: Item[] = [...imageList];
        // 만료/사용완료 데이터 필터링
        const now = new Date();
        filtering = filtering.filter(item => (new Date(item.date + "T" + item.time)) >= now && !item.is_used);
        // 카테고리 필터링
        if (selectedCategory !== "all") {
            filtering = filtering.filter(item => item.category_id === selectedCategory);
        }
        // 검색어 필터링
        filtering = filtering.filter(item => {
            return (item.title !== null && item.title.toLowerCase().includes(searchText.toLowerCase()))
                || (item.from_location !== null && item.from_location.toLowerCase().includes(searchText.toLowerCase()))
                || (item.to_location !== null && item.to_location.toLowerCase().includes(searchText.toLowerCase()))
                || (item.location !== null && item.location.toLowerCase().includes(searchText.toLowerCase()))
                || (item.details !== null && item.details.toLowerCase().includes(searchText.toLowerCase()))
                || (item.description !== null && item.description.toLowerCase().includes(searchText.toLowerCase()));
        });
        // 정렬
        if (sortCase === "valid") {
            filtering = filtering.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA.getTime() - dateTimeB.getTime();
            });
        } else if (sortCase === "created") {
            filtering = filtering.sort((a, b) => {
                const dateTimeA = new Date(a.created_at);
                const dateTimeB = new Date(b.created_at);
                return dateTimeA.getTime() - dateTimeB.getTime();
            });
        }
        return filtering;
    };

    const onValueChangeSelect = (sort: string) => {
        setSortCase(sort);
    };

    const handleChangeCategory = (category: string) => {
        setSelectedCategory(category);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchImageList();
        setRefreshing(false);
    };

    const fetchImageList = async () => {
        setIsLoading(true);
        const responseData = await getImageList();
        setIsLoading(false);
        if (responseData === null) {
            setAlertForm({
                title: "리스트 로드 실패",
                content: "리스트 로드에 실패했습니다. 앱을 재실행 해주세요.",
                showCancel: false,
                submit: null,
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
            // @ts-ignore
            setImageList(responseData);
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
                    await fetchImageList();
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

    const startRecoding = async () => {
        try {
            // @ts-ignore
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log(`[Audio Recording Start]`);
        } catch (err) {
            console.log(`[Audio Recording Error]: ${err}`);
        }
    };

    const stopRecording = async () => {
        if (recording) {
            setRecording(null);
            await recording.stopAndUnloadAsync();
            console.log(`[Audio Recording Stop]`);
            await Audio.setAudioModeAsync(
                {
                    allowsRecordingIOS: false,
                }
            );
            const uri = recording.getURI();
            setAudioUri(uri);
            console.log(`[Audio Recording Uri]: ${uri}`);
        }
    };

    const audioSearch = async () => {
        setIsLoading(true);
        setShowAudioAlert(false);
        if (audioUri !== null) {
            const fileType = "audio/m4a";
            const fileName = audioUri.split("/").pop() || "recording.m4a";
            const formData = new FormData();
            formData.append("file", {uri: audioUri, name: fileName, type: fileType} as any);

            const responseData = await audioSearchApi(formData);
            if (responseData === null) {
                setAlertForm({
                    title: "음성 인식 실패",
                    content: "음성 인식에 실패했습니다. 다시 시도해주세요.",
                    showCancel: false,
                    submit: null,
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
                setImageList(responseData);
            }
        }
        setAudioUri(null);
        setIsLoading(false);
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
        const loadImageList = async () => {
            const responseData = await getImageList();
            if (responseData === null) {
                setAlertForm({
                    title: "리스트 로드 실패",
                    content: "리스트 로드에 실패했습니다. 앱을 재실행 해주세요.",
                    showCancel: false,
                    submit: null,
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
                // @ts-ignore
                setImageList(responseData);
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchToken();
        // noinspection JSIgnoredPromiseFromCall
        loadCategoryList();
        // noinspection JSIgnoredPromiseFromCall
        loadImageList();
    }, []);

    const renderItem = ({item}: { item: Item }) => {
        const targetDate: Date = new Date(item.date);
        const currentDate: Date = new Date();
        const timeDifference: number = targetDate.getTime() - currentDate.getTime();
        const daysLeft: number = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const d_day: string = daysLeft == 0 ? 'D-Day' : daysLeft < 0 ? 'Expired' : 'D-' + daysLeft;

        return (
            <Pressable
                className={"p-2"}
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate("Detail", {item: item});
                }}
            >
                <HStack className={"flex w-full"}>
                    <Image
                        source={{uri: `${item.url}?sv=2022-11-02&ss=b&srt=o&sp=r&se=2025-02-28T10:19:22Z&st=2025-02-14T02:19:22Z&spr=https&sig=eGOeTigdul7Kd8%2BXnz3XpR6DfNM1vQYwXowhmsTbvqk%3D`}}
                        alt={`img{item.id}`}
                        size={"xl"}
                        className={"flex-0"}
                        resizeMode={"contain"}
                    />
                    <Box className={"flex-1"} style={{marginLeft: 10}}>
                        <VStack space={"xl"}>
                            <VStack>
                                <Text size={"md"}>
                                    {categoryList?.find(category => category.id === item.category_id)?.name}
                                </Text>
                                <Heading size={"lg"} className={"mb-4"}>
                                    {
                                        categoryList?.find(category => category.id === item.category_id)?.name === "교통" ? (
                                            `${item.from_location}에서 ${item.to_location}으로 가는 ${item.type} 티켓`
                                        ) : categoryList?.find(category => category.id === item.category_id)?.name === "약속" ? (
                                            `${item.type}: ${item.description.length > 20 ? item.description.substring(0, 20) + "..." : item.description}`
                                        ) : categoryList?.find(category => category.id === item.category_id)?.name === "기타" ? (
                                            `${item.description.length > 20 ? item.description.substring(0, 30) + "..." : item.description}`
                                        ) : (
                                            `${item.title}`
                                        )
                                    }
                                </Heading>
                            </VStack>
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"md"} className={"flex items-center justify-center"}>
                                    <Text size={"md"}>{item.date + " " + item.time}</Text>
                                    <Box className={"p-2 bg-primary-500 rounded-md"}>
                                        <Text size={"md"} bold className={"text-typography-0"}>{d_day}</Text>
                                    </Box>
                                </HStack>
                                <Pressable onPress={() => deleteConfirm(item?.id)}>
                                    <Ionicons name={"trash-outline"} size={24} color={"black"}/>
                                </Pressable>
                            </HStack>
                        </VStack>
                    </Box>
                </HStack>
            </Pressable>
        );
    };

    return (
        <Box className={"bg-white flex-1"}>
            {/* 카테고리 영역 */}
            <Box className={"p-2"}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className={"flex-shrink"}>
                    <HStack space={"md"} className={"p-2"}>
                        <Button
                            size={"md"}
                            className={`rounded-full border ${selectedCategory !== "all" ? "bg-white" : ""}`}
                            style={{minWidth: 75}}
                            onPress={() => handleChangeCategory("all")}
                        >
                            <Text
                                bold
                                className={`${selectedCategory !== "all" ? "" : "text-typography-0"}`}
                            >
                                전체
                            </Text>
                        </Button>
                        {
                            categoryList && categoryList.map((item: Category) => (
                                <Button
                                    key={item.id}
                                    size={"md"}
                                    className={`rounded-full border ${selectedCategory !== item.id ? "bg-white" : ""}`}
                                    style={{minWidth: 75}}
                                    onPress={() => handleChangeCategory(item.id)}
                                >
                                    <Text
                                        bold
                                        className={`${selectedCategory !== item.id ? "" : "text-typography-0"}`}
                                    >
                                        {item.name}
                                    </Text>
                                </Button>
                            ))
                        }
                    </HStack>
                </ScrollView>
            </Box>

            {/* 검색 영역 */}
            <HStack space={"md"} className={"p-4"}>
                {/* 정렬 Select */}
                <Select
                    className={"flex-0"}
                    style={{minWidth: 100}}
                    defaultValue={"만료기간 순"}
                    onValueChange={onValueChangeSelect}
                >
                    <SelectTrigger variant={"outline"} size={"md"}>
                        <SelectInput placeholder={"Select option"} className={"flex-1"}/>
                        <SelectIcon className={"mr-3"} as={ChevronDownIcon}/>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop/>
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator/>
                            </SelectDragIndicatorWrapper>
                            <SelectItem label={"만료기간 순"} value={"valid"}/>
                            <SelectItem label={"등록일 순"} value={"created"}/>
                        </SelectContent>
                    </SelectPortal>
                </Select>
                <Box className={"flex-1 flex-row justify-center items-center"}>
                    {/* 검색 Input */}
                    <Input
                        className={"flex-1"}
                        style={{marginRight: 10}}
                    >
                        <InputSlot className={"pl-3"}>
                            <InputIcon as={SearchIcon}/>
                        </InputSlot>
                        <InputField placeholder={"Search..."} value={searchText} onChangeText={setSearchText}/>
                    </Input>
                    {/* 음성 검색 */}
                    <Button
                        className={"rounded-full bg-custom-beige p-1"}
                        onPress={() => setShowAudioAlert(true)}
                    >
                        <Ionicons name="mic" size={24} color="black"/>
                    </Button>
                </Box>
            </HStack>

            {/* 리스트 영역 */}
            <HStack space={"sm"} className={"flex-row justify-center items-center"}>
                <Ionicons name="refresh" size={12} color="black"/>
                <Text>아래로 스크롤하여 새로고침</Text>
            </HStack>
            <FlatList
                data={filteredData()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                className={"flex-1 p-2"}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                }
                contentContainerStyle={filteredData().length <= 0 ? {
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center"
                } : {}}
                ListEmptyComponent={
                    <VStack space={"lg"} className={"justify-center items-center"}>
                        <Text size={"xl"}>등록된 쿠폰/티켓이 없습니다.</Text>
                        <Text size={"xl"}>우측 하단의 + 버튼을 눌러 등록해보세요.</Text>
                    </VStack>
                }
            />

            {/* 생성 화면 버튼 */}
            <Fab
                size={"lg"}
                className={"bg-primary-600 hover:bg-primary-700 active:bg-primary-800"}
                onPress={() => {
                    // @ts-ignore
                    navigation.navigate("Create");
                }}
            >
                <FabIcon as={AddIcon} color={"white"}/>
            </Fab>

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

            {/* Audio Dialog */}
            <AlertDialog
                isOpen={showAudioAlert}
                onClose={() => setShowAudioAlert(false)}
            >
                <AlertDialogBackdrop/>
                <AlertDialogContent className={"w-full max-w-[415px] gap-4 items-center"}>
                    <Pressable
                        className={"rounded-full h-[52px] w-[52px] bg-background-error items-center justify-center"}
                        onPress={recording ? stopRecording : startRecoding}
                    >
                        {
                            recording ? (
                                <Ionicons name="stop-circle" size={24} color="black"/>
                            ) : (
                                <Ionicons name="mic" size={24} color="black"/>
                            )
                        }
                    </Pressable>
                    <AlertDialogHeader className={"mb-2"}>
                        <Heading size={"md"}>AI 음성 검색</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text size={"sm"} className={"text-center"}>
                            상단의 마이크 버튼을 누르신 후, 음성을 녹음합니다.
                        </Text>
                        <Text size={"sm"} className={"text-center"}>
                            녹음 정지 버튼을 누르면 하단의 검색 버튼이 활성화 됩니다.
                        </Text>
                    </AlertDialogBody>
                    <AlertDialogFooter className={"mt-5"}>
                        <Button
                            size={"sm"}
                            onPress={audioSearch}
                            className={"px-[30px]"}
                            isDisabled={audioUri === null}
                        >
                            <ButtonText>검색</ButtonText>
                        </Button>
                        <Button
                            variant={"outline"}
                            action={"secondary"}
                            onPress={() => setShowAudioAlert(false)}
                            size={"sm"}
                            className={"px-[30px]"}
                            isDisabled={recording !== null}
                        >
                            <ButtonText>취소</ButtonText>
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

export default Home;