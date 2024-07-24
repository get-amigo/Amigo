import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { OtpProvider } from '../context/OtpContext';
import LoginScreen from '../pages/LoginScreen';
import OTPScreen from '../pages/OTPScreen';
import OnboardingScreen from '../pages/OnBoardingScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = (
    <OtpProvider>
        <Stack.Navigator
            screenOptions={{
                headerTintColor: '#fff',
                headerStyle: {
                    backgroundColor: COLOR.APP_BACKGROUND,
                },
                title: null,
            }}
        >
            <Stack.Group>
                <Stack.Screen
                    name={PAGES.ONBOARDING}
                    options={{
                        headerShown: false,
                    }}
                    component={OnboardingScreen}
                />
                <Stack.Screen
                    name={PAGES.LOGIN}
                    component={LoginScreen}
                    options={{
                        animation: 'fade',
                    }}
                />

                <Stack.Screen
                    name={PAGES.OTP}
                    component={OTPScreen}
                    options={{
                        animation: 'ios',
                    }}
                />
            </Stack.Group>
        </Stack.Navigator>
    </OtpProvider>
);

export default AuthNavigator;
