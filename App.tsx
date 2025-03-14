// noinspection JSDeprecatedSymbols

import "./global.css";
import {GluestackUIProvider} from "@/src/components/ui/gluestack-ui-provider";
import React, {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {BottomBar} from "@/src/components/common/navigation";
import {StatusBar} from "react-native";
import {createNativeStackNavigator} from "react-native-screens/native-stack";
import Start from "@/src/page/Start";
import Register from "@/src/page/Register";
import Login from "@/src/page/Login";
import Create from "@/src/page/Create";
import Detail from "@/src/page/Detail";
import Dispose from "@/src/page/Dispose";
import {initializeFCM} from "@/src/services/FcmService";

const Stack = createNativeStackNavigator();

const App = () => {
    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        initializeFCM(); // FCM 초기화 실행
    }, []);

    return (
        <GluestackUIProvider>
            <StatusBar/>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={"Start"} screenOptions={{headerShown: false}}>
                    <Stack.Screen name={"Start"} component={Start}/>
                    <Stack.Screen name={"Home"} component={BottomBar}/>
                    <Stack.Screen name={"Register"} component={Register}/>
                    <Stack.Screen name={"Login"} component={Login}/>
                    <Stack.Screen name={"Create"} component={Create}/>
                    <Stack.Screen name={"Detail"} component={Detail}/>
                    <Stack.Screen name={"Dispose"} component={Dispose}/>
                </Stack.Navigator>
            </NavigationContainer>
        </GluestackUIProvider>
    );
};

export default App;
