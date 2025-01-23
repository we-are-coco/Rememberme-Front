import "./global.css";
import {StyleSheet, Text, View} from 'react-native';
import {GluestackUIProvider} from "@/src/components/ui/gluestack-ui-provider";
import {Box} from "@/src/components/ui/box";

export default function App() {
    return (
        <GluestackUIProvider>
            <Box
                className={"bg-primary-500 p-5"}
            >
                <Text className={"text-typography-0"}>
                    Open up App.tsx to start working on your app!
                </Text>
            </Box>
        </GluestackUIProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
