import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react-native';
import { CalendarScreen } from '@/features/calendar';
import { TasksScreen } from '@/features/tasks';

export function PlannerScreen() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks'>('calendar');

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-3xl font-bold text-slate-900">Planner</Text>
        <Text className="text-base text-slate-600 mt-1">Calendar and tasks in one place.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-2 flex-row shadow-sm">
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-3 items-center flex-row justify-center ${
              activeTab === 'calendar' ? 'bg-purple-600' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('calendar')}
          >
            <CalendarIcon size={18} color={activeTab === 'calendar' ? '#FFFFFF' : '#64748B'} />
            <Text
              className={`ml-2 font-semibold ${
                activeTab === 'calendar' ? 'text-white' : 'text-slate-600'
              }`}
            >
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-3 items-center flex-row justify-center ${
              activeTab === 'tasks' ? 'bg-purple-600' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} color={activeTab === 'tasks' ? '#FFFFFF' : '#64748B'} />
            <Text
              className={`ml-2 font-semibold ${
                activeTab === 'tasks' ? 'text-white' : 'text-slate-600'
              }`}
            >
              Tasks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 mt-4">
        {activeTab === 'calendar' ? <CalendarScreen /> : <TasksScreen />}
      </View>
    </View>
  );
}
