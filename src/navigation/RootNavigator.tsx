import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@/store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export function RootNavigator() {
  const { session, profile, isInitializing, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#181A20' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  const shouldShowOnboarding = session && profile && !profile.family_id;

  return (
    <NavigationContainer>
      {session && profile ? (
        shouldShowOnboarding ? (
          <AuthNavigator initialRouteName="FamilyOnboarding" />
        ) : (
          <MainNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
