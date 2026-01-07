import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight } from 'lucide-react-native';
import type { MainStackParamList } from '@/navigation/MainNavigator';

const items: { label: string; route: keyof MainStackParamList }[] = [
  { label: 'Profile', route: 'Profile' },
];

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">More</Text>
        <Text className="text-base text-slate-600 mt-1">Everything else in one place.</Text>
      </View>

      <View className="px-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <View className="gap-3">
            {items.map((item) => (
              <TouchableOpacity
                key={item.label}
                className="bg-slate-50 rounded-2xl px-4 py-3 flex-row items-center justify-between"
                onPress={() => navigation.navigate(item.route)}
              >
                <Text className="text-slate-900 font-medium">{item.label}</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
