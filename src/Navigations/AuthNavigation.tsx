import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  LoginScreen_Nav,
  OTPScreen_Nav,
  OTPSuccessScreen_Nav,
  SignUpScreen_Nav,
  WelcomeScreen_Nav,
} from './navigations';
import WelcomeScreen from '../Screens/Auth/WelcomeScreen';
import LoginScreen from '../Screens/Auth/LoginScreen';
import OTPScreen from '../Screens/Auth/OTPScreen';
import SignUpScreen from '../Screens/Auth/SignUpScreen';
import OTPSuccessScreen from '../Screens/Auth/OTPSuccessScreen';

const AuthNavigation: React.FC<ScreenProps> = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={WelcomeScreen_Nav} component={WelcomeScreen} />
      <Stack.Screen name={LoginScreen_Nav} component={LoginScreen} />
      <Stack.Screen name={OTPScreen_Nav} component={OTPScreen} />
      <Stack.Screen name={OTPSuccessScreen_Nav} component={OTPSuccessScreen} />
      <Stack.Screen name={SignUpScreen_Nav} component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
