import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Calendar, ShoppingCart, User, MapPin } from 'lucide-react-native';
import { HomeScreen } from '@/features/home';
import { ShoppingScreen } from '@/features/shopping';
import { ProfileScreen } from '@/features/profile';
import { LocationsScreen } from '@/features/locations';
import { PlannerScreen } from '@/features/planner';
import { useI18n } from '@/i18n';

export type MainTabParamList = {
  Home: undefined;
  Planner: undefined;
  Locations: undefined;
  Shopping: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#181A20',
          borderTopWidth: 1,
          borderTopColor: '#23262F',
          height: 85,
          paddingTop: 12,
          paddingBottom: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Planner"
        component={PlannerScreen}
        options={{
          tabBarLabel: t('tabs.planner'),
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          tabBarLabel: t('tabs.map'),
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          tabBarLabel: t('tabs.shopping'),
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
