import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react-native';
import { CalendarScreen } from '@/features/calendar';
import { TasksScreen } from '@/features/tasks';

export function PlannerScreen() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks'>('calendar');

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      {/* Dekorativni krugovi */}
      <View style={{ position: 'absolute', top: 50, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: '#C4DEF5', opacity: 0.4 }} />
      <View style={{ position: 'absolute', top: 100, left: -10, width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5C4DE', opacity: 0.3 }} />

      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700' }}>Planner 📅</Text>
        <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Calendar and tasks in one place.</Text>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ 
          backgroundColor: '#1A1A1A', 
          borderRadius: 20, 
          padding: 6, 
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: '#2A2A2A'
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: activeTab === 'calendar' ? '#7C3AED' : 'transparent',
            }}
            onPress={() => setActiveTab('calendar')}
          >
            <CalendarIcon size={18} color={activeTab === 'calendar' ? '#FFFFFF' : '#6B7280'} />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: '600',
                color: activeTab === 'calendar' ? '#FFFFFF' : '#6B7280',
              }}
            >
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: activeTab === 'tasks' ? '#7C3AED' : 'transparent',
            }}
            onPress={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} color={activeTab === 'tasks' ? '#FFFFFF' : '#6B7280'} />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: '600',
                color: activeTab === 'tasks' ? '#FFFFFF' : '#6B7280',
              }}
            >
              Tasks
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, marginTop: 16 }}>
        {activeTab === 'calendar' ? <CalendarScreen /> : <TasksScreen />}
      </View>
    </View>
  );
}
