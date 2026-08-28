import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../Screens/HomeScreen";
import ServiceScreen from "../Screens/NavBarMenu/ServiceScreen";
import ProfileScreen from "../Screens/NavBarMenu/ProfileScreen";
import colors from "../constant/colors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Activity from "../Screens/NavBarMenu/ActivityScreen";
import React from "react";
import { Platform, View, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useAppTheme } from "../hooks/useAppTheme";
import { LocationSearch_Nav } from "./navigations";

const Tab = createBottomTabNavigator();

const TabNavigations: React.FC<any> = ({ navigation }) => {
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
                    backgroundColor: isDark ? '#020813' : '#FFFFFF',
                    height: Platform.OS === 'ios' ? 85 : 75, // Slightly taller
                    borderTopWidth: 0, // Removes the default gray border completely
                    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
                    paddingTop: 8,

                    // --- TOP SHADOW FOR IOS ---
                    shadowColor: isDark ? '#007BFF' : '#000',
                    shadowOffset: {
                        width: 0,
                        height: -4, // Softer top shadow
                    },
                    shadowOpacity: isDark ? 0.15 : 0.05,
                    shadowRadius: 10,

                    // --- TOP SHADOW FOR ANDROID ---
                    elevation: 10,

                },
                tabBarActiveTintColor: isDark ? '#00C2FF' : colors.button,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarIcon: ({ focused }) => {
                    let icons = {
                        Home: 'home',
                        Service: 'dashboard',
                        Activity: 'grading',
                        Profile: 'person'
                    } as const;

                    if (route.name === 'BookRide') return null;

                    const iconName = icons[route.name as keyof typeof icons];

                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <MaterialIcons name={iconName} size={focused ? 28 : 24} color={focused ? (isDark ? '#00C2FF' : colors.button) : '#94A3B8'} />
                        </View>
                    )
                },

            })
            }

        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Service" component={ServiceScreen} options={{ headerShown: false }} />

            {/* Custom Book Ride Button */}
            <Tab.Screen
                name="BookRide"
                component={View}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate(LocationSearch_Nav, { screenName: 'OneWay' });
                    },
                })}
                options={{
                    tabBarLabel: () => null,
                    tabBarButton: (props) => (
                        <View style={{ top: -24, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate(LocationSearch_Nav, { screenName: 'OneWay' })}
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: isDark ? '#007BFF' : colors.button, // Bright Blue
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: isDark ? '#00C2FF' : colors.button,
                                    shadowOpacity: 0.8,
                                    shadowRadius: 15,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 12,
                                }}
                            >
                                <MaterialCommunityIcons name="car" size={32} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={{
                                color: isDark ? '#00C2FF' : colors.button,
                                fontSize: 11,
                                fontWeight: '700',
                                marginTop: 6
                            }}>
                                Book Ride
                            </Text>
                        </View>
                    )
                }}
            />

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