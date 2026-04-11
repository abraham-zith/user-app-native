import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    LocationSearch_Nav,


} from './navigations';
import LocationSearch from '../Screens/LocationSelection';


const TripNavigation: React.FC<ScreenProps> = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name={LocationSearch_Nav}
                component={LocationSearch}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default TripNavigation;
