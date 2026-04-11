import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    RatingScreen_Nav,
    HelpScreen_Nav,
    PaymentScreen_Nav,
    ActivityScreen_Nav,
    ReferAndEarnScreen_Nav,
    SettingsScreen_Nav,
    ProfileUpdateScreen_Nav
} from './navigations';
import Activity from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/Activity';
import Rating from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/Rating';
import Help from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/Help';
import Payment from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/Payment';
import ReferAndEarn from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/ReferAndEarn';
import Settings from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/SettingsPage';
import ProfileUpdatescreen from '../Screens/NavBarMenu/ProfileScreen/ProfileScreenComponents/ProfileUpdateScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppTheme } from '../hooks/useAppTheme';
import { TouchableOpacity, View } from 'react-native';
import { Styles } from '../lib/styles';


const ProfileScreenComponents: React.FC<ScreenProps> = () => {
    const Stack = createStackNavigator();
    const { colors, isDark } = useAppTheme();

    return (
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity
                        style={[Styles.ml4]}
                        onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={28}
                            color={colors.text}
                            onPress={() => navigation.goBack()}
                        />
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: isDark ? colors.background : colors.card,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: colors.text,
                },
                headerTintColor: colors.text,
            })}>
            <Stack.Screen name={RatingScreen_Nav} component={Rating} options={{ headerTitle: 'Rating', }} />
            <Stack.Screen name={HelpScreen_Nav} component={Help} options={{ headerTitle: 'Help', }} />
            <Stack.Screen name={PaymentScreen_Nav} component={Payment} options={{ headerShown: false }} />
            <Stack.Screen name={ActivityScreen_Nav} component={Activity} options={{ headerTitle: 'Activity', }} />
            <Stack.Screen name={ReferAndEarnScreen_Nav} component={ReferAndEarn} options={{ headerShown: false }} />
            <Stack.Screen name={SettingsScreen_Nav} component={Settings} options={{ headerTitle: 'Settings', }} />
            <Stack.Screen
                name={ProfileUpdateScreen_Nav}
                component={ProfileUpdatescreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Profile',
                    headerBackground: () => (
                        <View style={{ flex: 1, backgroundColor: colors.background }} />
                    )
                }} />
        </Stack.Navigator>
    );
};

export default ProfileScreenComponents;
