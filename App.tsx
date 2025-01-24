import "./global.css";
import {GluestackUIProvider} from "@/src/components/ui/gluestack-ui-provider";
import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {BottomBar} from "@/src/components/common/navigation";
import {StatusBar} from 'react-native';

const App = () => {
    return (
        <GluestackUIProvider >
            <StatusBar/>
            <NavigationContainer>
                <BottomBar/>
            </NavigationContainer>
        </GluestackUIProvider>
    );
};

export default App;
