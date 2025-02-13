import {Text} from "@/src/components/ui/text";
import {Box} from "@/src/components/ui/box";
import {Button, ButtonText} from "@/src/components/ui/button";
import {HStack} from "@/src/components/ui/hstack";
import {FlatList, ScrollView} from "react-native";
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
import data from "@/src/static/data/flatlist_test";
import {Fab, FabIcon} from "@/src/components/ui/fab";
import {VStack} from "@/src/components/ui/vstack";
import {Heading} from "@/src/components/ui/heading";
import {Card} from "@/src/components/ui/card";
import {Pressable} from "@/src/components/ui/pressable";
import {Ionicons} from "@expo/vector-icons";
import {Image} from "@/src/components/ui/image";
import {useNavigation} from "@react-navigation/native";
import {getToken, removeToken} from '../services/AuthService';
import {getCategoryList, getUser} from "@/src/api/api";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/src/components/ui/alert-dialog";
import {Category, Item, AlertForm} from "@/src/utils/interfaceCase";

const Home = () => {
    const navigation = useNavigation();
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [categoryList, setCategoryList] = useState<Category[] | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const filteredData = () => {
        return data.filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()));
    };

    const onValueChangeSelect = (message: string) => {
        alert(message);
    };

    const handleChangeCategory = (category: string) => {
        setSelectedCategory(category);
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
            setSelectedCategory(responseData ? responseData[0].id : "");
        };
        // noinspection JSIgnoredPromiseFromCall
        fetchToken();
        // noinspection JSIgnoredPromiseFromCall
        loadCategoryList();
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
                        source={{
                            uri: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                        }}
                        alt={`img{item.id}`}
                        size={"xl"}
                        // resizeMode={"contain"}
                    />
                    <Card className={"flex-1"}>
                        <Text size={"md"}>
                            {categoryList?.find(category => category.id === item.category_id)?.name}
                        </Text>
                        <VStack space={"xl"}>
                            <Heading size={"lg"} className={"mb-4"}>
                                {item.title}
                            </Heading>
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"md"} className={"flex items-center justify-center"}>
                                    <Text size={"md"}>{item.date + " " + item.time}</Text>
                                    <Box className={"p-2 bg-primary-500 rounded-md"}>
                                        <Text size={"md"} bold className={"text-typography-0"}>{d_day}</Text>
                                    </Box>
                                </HStack>
                                <Pressable onPress={() => {
                                    alert(item.id)
                                }}>
                                    <Ionicons name={"trash-outline"} size={24} color={"black"}/>
                                </Pressable>
                            </HStack>
                        </VStack>
                    </Card>
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
                    defaultValue={"유효기간 순"}
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
                {/* 검색 Input */}
                <Input
                    className={"flex-1"}
                >
                    <InputSlot className={"pl-3"}>
                        <InputIcon as={SearchIcon}/>
                    </InputSlot>
                    <InputField placeholder={"Search..."} value={searchText} onChangeText={setSearchText}/>
                </Input>
            </HStack>

            {/* 리스트 영역 */}
            <FlatList
                data={filteredData()}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                className={"flex-1 p-2"}
            />
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

export default Home;