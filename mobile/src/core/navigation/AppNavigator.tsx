import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MySubscriptionScreen from '../../features/subscription/screens/MySubscriptionScreen';
import SplashScreen from '../../features/splash/SplashScreen';
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';
import ForgotPasswordScreen from '../../features/auth/screens/ForgotPasswordScreen';
import ChangePasswordScreen from '../../features/profile/screens/ChangePasswordScreen';
import BottomTabNavigator from './BottomTabNavigator';
import {RootStackParamList} from './types';
import PaymentHistoryScreen from '../../features/payments/screens/PaymentHistoryScreen';
import VerifyOtpScreen from '../../features/auth/screens/VerifyOtpScreen';
import UsdtDepositScreen from '../../features/wallet/screens/UsdtDepositScreen'; 
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
      />

      <Stack.Screen
      name="MySubscription"
      component={MySubscriptionScreen}
      options={{
        title: 'My Subscription',
        }}
      />
      <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{
        title: 'Change Password',
        headerShown: true,
        }}
      />
      <Stack.Screen
       name="PaymentHistory"
       component={PaymentHistoryScreen}
       options={{
       title: 'Payment History',
       headerShown: true,
       }}
      />
      <Stack.Screen
        name="UsdtDeposit"
        component={UsdtDepositScreen}
      /> 



    </Stack.Navigator>
  );
};

export default AppNavigator;