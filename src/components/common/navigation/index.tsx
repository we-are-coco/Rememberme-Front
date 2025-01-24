import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from '@expo/vector-icons';
import Home from "@/src/page/Home";
import Settings from "@/src/page/Settings";

const Tab = createBottomTabNavigator();

const BottomBar = () => {
    return (
        <Tab.Navigator
            initialRouteName={"Home"}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name={"Home"}
                component={Home}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={"home"} size={size} color={color}/>
                    ),
                    tabBarActiveTintColor: "#ffaa00"
                }}
            />
            <Tab.Screen
                name={"Settings"}
                component={Settings}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={"settings-sharp"} size={size} color={color}/>
                    ),
                    tabBarActiveTintColor: "#ffaa00"
                }}
            />
        </Tab.Navigator>
    );
};

export {BottomBar};