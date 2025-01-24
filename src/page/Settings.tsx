import {Text} from "@/src/components/ui/text";
import {Center} from "@/src/components/ui/center";
import {Fab, FabIcon} from "@/src/components/ui/fab";
import {EditIcon} from "@/src/components/ui/icon";
import React from "react";
import {Box} from "@/src/components/ui/box";

const Settings = () => {
    return (
        <Box className={"h-full"}>
            {/* 리스트 영역 */}
            <Center className={"h-screen w-screen"}>
                <Text>Settings</Text>
                <Fab
                    size={"lg"}
                    className={"bg-primary-600 hover:bg-primary-700 active:bg-primary-800"}
                >
                    <FabIcon as={EditIcon} color={"white"}/>
                </Fab>
            </Center>
        </Box>
    );
};

export default Settings;