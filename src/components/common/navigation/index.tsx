import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from '@expo/vector-icons';
import Home from "@/src/page/Home";
import Settings from "@/src/page/Settings";
import Schedule from "@/src/page/Schedule";

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
                    tabBarActiveTintColor: "#ffaa00",
                    title: "홈 화면"
                }}
            />
            <Tab.Screen
                name={"Schedule"}
                component={Schedule}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={"calendar-number"} size={size} color={color}/>
                    ),
                    tabBarActiveTintColor: "#ffaa00",
                    title: "일정 추천"
                }}
            />
            <Tab.Screen
                name={"Settings"}
                component={Settings}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name={"settings-sharp"} size={size} color={color}/>
                    ),
                    tabBarActiveTintColor: "#ffaa00",
                    title: "설정"
                }}
            />
        </Tab.Navigator>
    );
};

export {BottomBar};