import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../Screens/HomeScreen";
import ServiceScreen from "../Screens/NavBarMenu/ServiceScreen";
import ProfileScreen from "../Screens/NavBarMenu/ProfileScreen";
import colors from "../constant/colors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Activity from "../Screens/NavBarMenu/ActivityScreen";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppTheme } from "../hooks/useAppTheme";

const Tab = createBottomTabNavigator();

const TabNavigations: React.FC<ScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const activeTripsCount = useSelector((state: RootState) => state.tripSlice.activeTrips.length);
    const { colors: appColors, isDark } = useAppTheme();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({

                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4, // Adds space between icon and text
                },
                tabBarStyle: {
                    backgroundColor: isDark ? appColors.background : '#FFFFFF',
                    height: Platform.OS === 'ios' ? 85 : 75, // Slightly taller
                    borderTopWidth: 0, // Removes the default gray border completely
                    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
                    paddingTop: 8,

                    // --- TOP SHADOW FOR IOS ---
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -4, // Softer top shadow
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,

                    // --- TOP SHADOW FOR ANDROID ---
                    elevation: 10,

                },
                tabBarActiveTintColor: isDark ? appColors.primary : colors.button,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarIcon: ({ focused }) => {
                    let icons = {
                        Home: 'home',
                        Service: 'dashboard',
                        Activity: 'grading',
                        Profile: 'person'
                    } as const;

                    const iconName = icons[route.name as keyof typeof icons];

                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <MaterialIcons name={iconName} size={focused ? 28 : 24} color={focused ? isDark ? appColors.primary : colors.button : '#94A3B8'} />
                        </View>
                    )
                },

            })
            }

        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Service" component={ServiceScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Activity" component={Activity}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: 'Ride History',
                    tabBarBadge: activeTripsCount > 0 ? activeTripsCount : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: colors.button,
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                        ...(Platform.OS === 'android' && { top: -2 }), // Slight adjustment for Android
                    },
                    headerLeft: () => (
                        <MaterialCommunityIcons name="arrow-left" size={28} style={{ marginLeft: 10 }} color={appColors.text} onPress={() => navigation.goBack()} />
                    ),
                    headerStyle: {
                        backgroundColor: appColors.background,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    headerTitleStyle: {
                        color: appColors.text,
                        fontWeight: 'bold'
                    }
                })} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={({ navigation }) => ({
                headerShown: true,
                headerTitle: 'Profile',
                headerLeft: () => (
                    <MaterialCommunityIcons name="arrow-left" size={28} style={{ marginLeft: 10 }} color={appColors.text} onPress={() => navigation.goBack()} />
                ),
                headerStyle: {
                    backgroundColor: appColors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    color: appColors.text,
                    fontWeight: 'bold'
                }
            })} />

        </Tab.Navigator>
    )
}

export default TabNavigations;