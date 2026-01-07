import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { FamilyOnboardingScreen } from '@/features/auth/FamilyOnboardingScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  FamilyOnboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator({ initialRouteName }: { initialRouteName?: keyof AuthStackParamList }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="FamilyOnboarding" component={FamilyOnboardingScreen} />
    </Stack.Navigator>
  );
}
