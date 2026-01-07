import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  CheckSquare,
  Gift,
  Calendar,
  ShoppingCart,
  User,
  MapPin,
  Bell,
  StickyNote,
} from 'lucide-react-native';
import { HomeScreen } from '@/features/home';
import { TasksScreen } from '@/features/tasks';
import { RewardsScreen } from '@/features/rewards';
import { CalendarScreen } from '@/features/calendar';
import { ShoppingScreen } from '@/features/shopping';
import { ProfileScreen } from '@/features/profile';
import { LocationsScreen } from '@/features/locations';
import { RemindersScreen } from '@/features/reminders';
import { FridgeScreen } from '@/features/fridge';

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Rewards: undefined;
  Calendar: undefined;
  Locations: undefined;
  Reminders: undefined;
  Shopping: undefined;
  Fridge: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Gift size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Fridge"
        component={FridgeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <StickyNote size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
