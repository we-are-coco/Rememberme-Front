import {Box} from "@/src/components/ui/box";
import {Text} from "@/src/components/ui/text";
import React, {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {HStack} from "@/src/components/ui/hstack";
import {Button, ButtonText} from "@/src/components/ui/button";
import {FlatList, ScrollView} from "react-native";
import {Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader,} from "@/src/components/ui/modal";
import {Heading} from "@/src/components/ui/heading";
import {Input, InputField} from "@/src/components/ui/input";
import {FormControl, FormControlLabel, FormControlLabelText} from "@/src/components/ui/form-control";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {recommendCoupon} from "@/src/api/api";
import {removeToken} from "@/src/services/AuthService";
import {AlertForm, RecommendData} from "@/src/utils/interfaceCase";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader
} from "@/src/components/ui/alert-dialog";
import {Spinner} from "@/src/components/ui/spinner";
import colors from "tailwindcss/colors";
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionIcon,
    AccordionItem,
    AccordionTitleText,
    AccordionTrigger
} from "@/src/components/ui/accordion";
import {AddIcon, RemoveIcon} from "@/src/components/ui/icon";
import {VStack} from "@/src/components/ui/vstack";
import {Card} from "@/src/components/ui/card";

const Schedule = () => {
    const navigation = useNavigation();
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedRange, setSelectedRange] = useState<string>("");
    const [showDateModal, setShowDateModal] = useState(false);
    const [diffDays, setDiffDays] = useState<number>(7);
    const [alertForm, setAlertForm] = useState<AlertForm>({
        title: "",
        content: "",
        showCancel: false,
        submit: null,
    });
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recommendData, setRecommendData] = useState<RecommendData[]>([]);

    const handleChangeRange = (range: string) => {
        const date = new Date();
        if (range === "1month") {
            const startDt = convertDate(date);
            date.setDate(date.getDate() + 30);
            const endDt = convertDate(date);
            setStartDate(startDt);
            setEndDate(endDt);
            diffDay(startDt, endDt);
        } else if (range === "1week") {
            const startDt = convertDate(date);
            date.setDate(date.getDate() + 7);
            const endDt = convertDate(date);
            setStartDate(startDt);
            setEndDate(endDt);
            diffDay(startDt, endDt);
        } else if (range === "3day") {
            const startDt = convertDate(date);
            date.setDate(date.getDate() + 3);
            const endDt = convertDate(date);
            setStartDate(startDt);
            setEndDate(endDt);
            diffDay(startDt, endDt);
        } else if (range === "custom") {
            setShowDateModal(true);
        }

        setSelectedRange(range);
    };

    const convertDate = (date: Date) => {
        const dateStr = date.toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'});
        return dateStr.split(".").map((part: string) => part.trim()).filter(Boolean).join("-");
    };

    const diffDay = (startDate: string, endDate: string) => {
        const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime();
        setDiffDays(diffTime / (1000 * 60 * 60 * 24));
    };

    const showDatePicker = (dateType: string) => {
        DateTimePickerAndroid.open({
            value: new Date(),
            onChange: (event, date) => handleDatePicker(event, date, dateType),
            mode: "date",
            is24Hour: true,
            minimumDate: new Date(),
        });
    };

    const handleDatePicker = (_event: any, selectedDate: any, type: string) => {
        const date = convertDate(selectedDate);
        if (type === "start") {
            if (new Date(date) > new Date(endDate)) {
                setEndDate(date);
                diffDay(date, date);
            } else {
                diffDay(date, endDate);
            }
            setStartDate(date);
        } else if (type === "end") {
            if (new Date(date) < new Date(startDate)) {
                setStartDate(date);
                diffDay(date, date);
            } else {
                diffDay(startDate, date);
            }
            setEndDate(date);
        }
    };

    const printRecommendations = async () => {
        setIsLoading(true);
        const responseData = await recommendCoupon(diffDays);
        setIsLoading(false);
        if (responseData === null) {
            setAlertForm({
                title: "조회 실패",
                content: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
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
            setRecommendData(responseData);
        }
    };

    const groupAndSortData = () => {
        const sortedData = recommendData.sort((a, b) => a.reco_date.localeCompare(b.reco_date));

        const groupedMap = new Map();

        sortedData.forEach((item) => {
            const {reco_date, is_reco} = item;

            if (!groupedMap.has(reco_date)) {
                groupedMap.set(reco_date, {true: [], false: []});
            }

            // @ts-ignore
            groupedMap.get(reco_date)[is_reco].push(item);
        });

        groupedMap.forEach((group) => {
            // @ts-ignore
            group.true.sort((a, b) => a.reco_time.localeCompare(b.reco_time));
            // @ts-ignore
            group.false.sort((a, b) => a.reco_time.localeCompare(b.reco_time));
        });

        return Object.fromEntries(groupedMap);
    };

    useEffect(() => {
        setSelectedRange("1week");
        const date = new Date();
        setStartDate(convertDate(date));
        date.setDate(date.getDate() + 7);
        setEndDate(convertDate(date));
    }, []);

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        printRecommendations();
    }, [diffDays]);

    // @ts-ignore
    return (
        <Box className={"bg-white flex-1"}>
            {/* Header */}
            <Box className={"flex-row justify-center items-center p-4"}>
                <Text size={"2xl"} bold={true}>
                    AI 일정 추천 리스트
                </Text>
            </Box>

            {/* 기간 선택 영역 */}
            <HStack space={"lg"} className={"flex justify-center items-center p-4"}>
                <Text bold size={"xl"}>기간</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className={"flex-shrink"}>
                    <HStack space={"md"}>
                        <Button
                            size={"md"}
                            className={`rounded-full border ${selectedRange !== "1month" ? "bg-white" : ""}`}
                            style={{minWidth: 75}}
                            onPress={() => handleChangeRange("1month")}
                        >
                            <Text
                                bold
                                className={`${selectedRange !== "1month" ? "" : "text-typography-0"}`}
                            >
                                한달
                            </Text>
                        </Button>
                        <Button
                            size={"md"}
                            className={`rounded-full border ${selectedRange !== "1week" ? "bg-white" : ""}`}
                            style={{minWidth: 75}}
                            onPress={() => handleChangeRange("1week")}
                        >
                            <Text
                                bold
                                className={`${selectedRange !== "1week" ? "" : "text-typography-0"}`}
                            >
                                일주일
                            </Text>
                        </Button>
                        <Button
                            size={"md"}
                            className={`rounded-full border ${selectedRange !== "3day" ? "bg-white" : ""}`}
                            style={{minWidth: 75}}
                            onPress={() => handleChangeRange("3day")}
                        >
                            <Text
                                bold
                                className={`${selectedRange !== "3day" ? "" : "text-typography-0"}`}
                            >
                                3일
                            </Text>
                        </Button>
                        <Button
                            size={"md"}
                            className={`rounded-full border ${selectedRange !== "custom" ? "bg-white" : ""}`}
                            style={{minWidth: 75}}
                            onPress={() => handleChangeRange("custom")}
                        >
                            <Text
                                bold
                                className={`${selectedRange !== "custom" ? "" : "text-typography-0"}`}
                            >
                                기간 입력
                            </Text>
                        </Button>
                    </HStack>
                </ScrollView>
            </HStack>
            <Text style={{paddingLeft: 15}}>{startDate} ~ {endDate}</Text>

            {/* Content */}
            <FlatList
                data={Object.keys(groupAndSortData())}
                renderItem={({item: reco_date}) => (
                    <Accordion className="p-3 w-full" size={"lg"}>
                        <AccordionItem value={reco_date} key={reco_date}>
                            <AccordionHeader>
                                <AccordionTrigger className="focus:web:rounded-lg">
                                    {({isExpanded}) => {
                                        return (
                                            <>
                                                {isExpanded ? (
                                                    <AccordionIcon as={RemoveIcon} className="mr-3"/>
                                                ) : (
                                                    <AccordionIcon as={AddIcon} className="mr-3"/>
                                                )}
                                                <AccordionTitleText>
                                                    <Text size={"2xl"} bold>
                                                        {reco_date}
                                                    </Text>
                                                </AccordionTitleText>
                                            </>
                                        )
                                    }}
                                </AccordionTrigger>
                            </AccordionHeader>
                            <AccordionContent className={"p-2"}>
                                <FlatList
                                    data={["true", "false"]}
                                    renderItem={({item: isReco}) => {
                                        // @ts-ignore
                                        const items = groupAndSortData()[reco_date][isReco === "true"];
                                        if (!items.length) return null; // 빈 리스트는 렌더링 안함

                                        return (
                                            <Accordion className="p-3 w-full" size={"lg"}>
                                                <AccordionItem value={isReco} key={isReco}>
                                                    <AccordionHeader className={"bg-custom-beige"}>
                                                        <AccordionTrigger className="focus:web:rounded-lg">
                                                            {({isExpanded}) => {
                                                                return (
                                                                    <>
                                                                        {isExpanded ? (
                                                                            <AccordionIcon as={RemoveIcon}
                                                                                           className="mr-3"/>
                                                                        ) : (
                                                                            <AccordionIcon as={AddIcon}
                                                                                           className="mr-3"/>
                                                                        )}
                                                                        <AccordionTitleText>
                                                                            {isReco === "true" ? "AI 추천 일정" : "고정 일정"}
                                                                        </AccordionTitleText>
                                                                    </>
                                                                )
                                                            }}
                                                        </AccordionTrigger>
                                                    </AccordionHeader>
                                                    <AccordionContent className={"p-2"}>
                                                        <FlatList
                                                            data={items}
                                                            keyExtractor={(item) => item.screenshot_id}
                                                            renderItem={({item}) => (
                                                                <Card size={"md"} style={{paddingLeft: 30}}>
                                                                    <Text style={{marginBottom: 5}}>
                                                                        {item.reco_time}
                                                                    </Text>
                                                                    <VStack space={"md"}>
                                                                        {
                                                                            item.brand && item.item && (
                                                                                <Text size={"lg"}>
                                                                                    {item.brand + " " + item.item}
                                                                                </Text>
                                                                            )
                                                                        }
                                                                        {
                                                                            item.description !== null && (
                                                                                <Text size={"md"}>
                                                                                    {item.description}
                                                                                </Text>
                                                                            )
                                                                        }
                                                                    </VStack>
                                                                </Card>
                                                            )}
                                                        />
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        );
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
                keyExtractor={(date) => date}
                className={"flex-1 p-2"}
                contentContainerStyle={recommendData.length <= 0 ? {
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center"
                } : {}}
                ListEmptyComponent={
                    <VStack space={"lg"} className={"justify-center items-center"}>
                        <Text size={"xl"}>추천된 일정이 없습니다.</Text>
                    </VStack>
                }
            />

            {/* 날짜 모달 */}
            <Modal
                isOpen={showDateModal}
                onClose={() => {
                    setShowDateModal(false);
                }}
            >
                <ModalBackdrop/>
                <ModalContent>
                    <ModalHeader className="flex-col items-start gap-3">
                        <Heading>기간 입력</Heading>
                        <Text size="sm">일정을 확인할 마지막 날짜를 입력하세요.</Text>
                    </ModalHeader>
                    <ModalBody className="mb-4 mt-4">
                        <HStack space={"md"}>
                            {/*<FormControl className={"flex-1 justify-center"}>*/}
                            {/*    <FormControlLabel>*/}
                            {/*        <FormControlLabelText>From</FormControlLabelText>*/}
                            {/*    </FormControlLabel>*/}
                            {/*    <Input className={"rounded-full"} size={"xl"}>*/}
                            {/*        <InputField*/}
                            {/*            type={"text"}*/}
                            {/*            value={startDate}*/}
                            {/*            onKeyPress={() => setStartDate(startDate)}*/}
                            {/*            onPress={() => showDatePicker("start")}*/}
                            {/*        />*/}
                            {/*    </Input>*/}
                            {/*</FormControl>*/}
                            <FormControl className={"flex-1 justify-center"}>
                                <FormControlLabel>
                                    <FormControlLabelText>To</FormControlLabelText>
                                </FormControlLabel>
                                <Input className={"rounded-full"} size={"xl"}>
                                    <InputField
                                        type={"text"}
                                        value={endDate}
                                        onKeyPress={() => setEndDate(endDate)}
                                        onPress={() => showDatePicker("end")}
                                    />
                                </Input>
                            </FormControl>
                        </HStack>
                    </ModalBody>
                    <ModalFooter className="flex-col items-start">
                        <Button
                            className="w-full"
                            onPress={() => setShowDateModal(false)}
                        >
                            <ButtonText>확인</ButtonText>
                        </Button>
                    </ModalFooter>
                </ModalContent>
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

export default Schedule;