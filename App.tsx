import "./global.css";
import {GluestackUIProvider} from "@/src/components/ui/gluestack-ui-provider";
import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {BottomBar} from "@/src/components/common/navigation";
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from "react-native-screens/native-stack";
import Start from "@/src/page/Start";
import Register from "@/src/page/Register";
import Login from "@/src/page/Login";

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <GluestackUIProvider>
            <StatusBar/>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={"Start"} screenOptions={{headerShown: false}}>
                    <Stack.Screen name={"Start"} component={Start}/>
                    <Stack.Screen name={"Home"} component={BottomBar}/>
                    <Stack.Screen name={"Register"} component={Register}/>
                    <Stack.Screen name={"Login"} component={Login}/>
                </Stack.Navigator>
            </NavigationContainer>
        </GluestackUIProvider>
    );
};

export default App;
