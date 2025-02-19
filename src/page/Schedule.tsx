import {Box} from "@/src/components/ui/box";
import {Text} from "@/src/components/ui/text";
import React, {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {HStack} from "@/src/components/ui/hstack";
import {Button, ButtonText} from "@/src/components/ui/button";
import {ScrollView} from "react-native";
import {Modal, ModalBackdrop, ModalBody, ModalContent, ModalFooter, ModalHeader,} from "@/src/components/ui/modal";
import {Heading} from "@/src/components/ui/heading";
import {Input, InputField} from "@/src/components/ui/input";
import {FormControl, FormControlLabel, FormControlLabelText} from "@/src/components/ui/form-control";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";

const Schedule = () => {
    const navigation = useNavigation();
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [selectedRange, setSelectedRange] = useState<string>("");
    const [showDateModal, setShowDateModal] = useState(false);

    const handleChangeRange = (range: string) => {
        const date = new Date();
        if (range === "1week") {
            setStartDate(convertDate(date));
            date.setDate(date.getDate() + 7);
            setEndDate(convertDate(date));
        } else if (range === "3day") {
            setStartDate(convertDate(date));
            date.setDate(date.getDate() + 3);
            setEndDate(convertDate(date));
        } else if (range === "custom") {
            setShowDateModal(true);
        }

        setSelectedRange(range);
    };

    const convertDate = (date: Date) => {
        const dateStr = date.toLocaleDateString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit'});
        return dateStr.split(".").map((part: string) => part.trim()).filter(Boolean).join("-");
    };

    const showDatePicker = (dateType: string) => {
        DateTimePickerAndroid.open({
            value: new Date(),
            onChange: (event, date) => handleDatePicker(event, date, dateType),
            mode: "date",
            is24Hour: true,
        });
    };

    const handleDatePicker = (_event: any, selectedDate: any, type: string) => {
        const date = convertDate(selectedDate);
        if (type === "start") {
            setStartDate(date);
            if (new Date(date) > new Date(endDate)) {
                setEndDate(date);
            }
        } else if (type === "end") {
            if (new Date(date) < new Date(startDate)) {
                setStartDate(date);
            }
            setEndDate(date);
        }
    };

    useEffect(() => {
        setSelectedRange("1week");
        const date = new Date();
        setStartDate(convertDate(date));
        date.setDate(date.getDate() + 7);
        setEndDate(convertDate(date));
    }, []);

    return (
        <Box className={"bg-white flex-1"}>
            {/* Header */}
            <Box className={"flex-row justify-center items-center p-4"}>
                <Text size={"2xl"} bold={true}>
                    추천 일정 리스트
                </Text>
            </Box>

            {/* 기간 선택 영역 */}
            <HStack space={"lg"} className={"flex justify-center items-center p-4"}>
                <Text bold size={"xl"}>기간</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className={"flex-shrink"}>
                    <HStack space={"md"}>
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
                        <Text size="sm">일정을 확인할 시작 날짜와 마지막 날짜를 입력하세요.</Text>
                    </ModalHeader>
                    <ModalBody className="mb-4 mt-4">
                        <HStack space={"md"}>
                            <FormControl className={"flex-1 justify-center"}>
                                <FormControlLabel>
                                    <FormControlLabelText>From</FormControlLabelText>
                                </FormControlLabel>
                                <Input className={"rounded-full"} size={"xl"}>
                                    <InputField
                                        type={"text"}
                                        value={startDate}
                                        onKeyPress={() => setStartDate(startDate)}
                                        onPress={() => showDatePicker("start")}
                                    />
                                </Input>
                            </FormControl>
                            <FormControl className={"flex-1 justify-center"}>
                                <FormControlLabel>
                                    <FormControlLabelText>To</FormControlLabelText>
                                </FormControlLabel>
                                <Input className={"rounded-full"} size={"xl"}>
                                    <InputField
                                        type={"text"}
                                        value={endDate}
                                        onKeyPress={() => setStartDate(endDate)}
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
        </Box>
    );
};

export default Schedule;