import {Text} from "@/src/components/ui/text";
import {Box} from "@/src/components/ui/box";
import {Button} from "@/src/components/ui/button";
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
import category from "@/src/static/data/category";
import {useNavigation} from "@react-navigation/native";
import {getToken} from '../services/AuthService';

interface Category {
    id: number;
    name: string;
    code: string;
}

interface Item {
    id: number;
    category: string;
    title: string;
    expires: string;
}

const Home = () => {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState("");

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

    const filteredData = data.filter(item => item.title.toLowerCase().includes(searchText.toLowerCase()));

    const onValueChangeSelect = (message: string) => {
        alert(message);
    };

    const renderItem = ({item}: { item: Item }) => {
        const targetDate: Date = new Date(item.expires);
        const currentDate: Date = new Date();
        const timeDifference: number = targetDate.getTime() - currentDate.getTime();
        const daysLeft: number = Math.ceil(timeDifference / (1000 * 3600 * 24));
        const d_day: string = daysLeft == 0 ? 'D-Day' : daysLeft < 0 ? 'Expired' : 'D-' + daysLeft;

        return (
            <Pressable className={"p-2"} onPress={() => {
                alert("test")
            }}>
                <HStack className={"flex w-full"}>
                    <Image
                        source={{
                            uri: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                        }}
                        alt={`img{item.id}`}
                        size={"xl"}
                    />
                    <Card className={"flex-1"}>
                        <Text size={"md"}>{item.category}</Text>
                        <VStack space={"2xl"}>
                            <Heading size={"lg"} className={"mb-4"}>
                                {item.title}
                            </Heading>
                            <HStack className={"flex items-center justify-between"}>
                                <HStack space={"md"} className={"flex items-center justify-center"}>
                                    <Text size={"md"}>{item.expires}</Text>
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
                            category.map((item: Category) => (
                                <Button
                                    key={item.id}
                                    size={"md"}
                                    className={"rounded-full"}
                                >
                                    <Text bold className={"text-typography-0"}>{item.name}</Text>
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
                    className={"w-28"}
                    defaultValue={"유효기간 순"}
                    onValueChange={onValueChangeSelect}
                >
                    <SelectTrigger variant={"outline"} size={"md"}>
                        <SelectInput placeholder={"Select option"}/>
                        <SelectIcon className={"mr-3"} as={ChevronDownIcon}/>
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop/>
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator/>
                            </SelectDragIndicatorWrapper>
                            <SelectItem label={"유효기간 순"} value={"valid"}/>
                            <SelectItem label={"사용처 순"} value={"where"}/>
                            <SelectItem label={"등록 순"} value={"created"}/>
                            <SelectItem label={"상품명 순"} value={"title"}/>
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
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                className={"flex-1 p-2"}
            />
            <Fab
                size={"lg"}
                className={"bg-primary-600 hover:bg-primary-700 active:bg-primary-800"}
            >
                <FabIcon as={AddIcon} color={"white"}/>
            </Fab>
        </Box>
    );
};

export default Home;