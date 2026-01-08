import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuthStore } from '@/store';
import { fetchTasks } from '@/services/tasks';
import { fetchEvents } from '@/services/calendar';
import { fetchShoppingItems } from '@/services/shopping';
import { getProfilePoints } from '@/utils/profile';
import type { Task, CalendarEvent, ShoppingItem } from '@/types';

export function HomeScreen() {
  const { profile, family, familyMembers } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const [taskData, eventData, shoppingData] = await Promise.all([
        fetchTasks(family.id),
        fetchEvents(family.id),
        fetchShoppingItems(family.id),
      ]);
      setTasks(taskData);
      setEvents(eventData);
      setShopping(shoppingData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [family?.id]);

  const points = getProfilePoints(profile);
  const nextEvent = events[0];
  const activeTasks = tasks.filter((task) => task.status === 'active' || task.status === 'pending');
  const shoppingOpen = shopping.filter((item) => !(item.is_checked ?? item.is_purchased));

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}
    >
      <View className="px-6 pt-8 pb-6">
        <Text className="text-sm font-semibold text-slate-500">FamilySync</Text>
        <Text className="text-3xl font-bold text-slate-900 mt-2">
          Hey {profile?.name ?? 'there'}!
        </Text>
        <Text className="text-base text-slate-600 mt-1">
          {family?.name ?? 'Your family'} dashboard
        </Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-sm font-semibold text-slate-500">Points</Text>
          <Text className="text-4xl font-bold text-purple-600 mt-2">{points}</Text>
          <Text className="text-sm text-slate-500 mt-1">Keep completing tasks to earn more.</Text>
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Tasks</Text>
          <Text className="text-sm text-slate-500 mt-1">
            {activeTasks.length} active tasks in your family
          </Text>
          {isLoading ? (
            <View className="mt-4">
              <ActivityIndicator color="#7C3AED" />
            </View>
          ) : (
            <View className="mt-4 gap-2">
              {activeTasks.slice(0, 3).map((task) => (
                <View key={task.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                  <Text className="text-slate-900 font-medium">{task.title}</Text>
                  <Text className="text-xs text-slate-500 mt-1">{task.points ?? 0} pts</Text>
                </View>
              ))}
              {activeTasks.length === 0 && (
                <Text className="text-sm text-slate-500">No active tasks yet.</Text>
              )}
            </View>
          )}
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Next event</Text>
          {nextEvent ? (
            <View className="mt-3">
              <Text className="text-slate-900 font-medium">{nextEvent.title}</Text>
              <Text className="text-sm text-slate-500 mt-1">
                {nextEvent.event_date}
                {nextEvent.event_time ? ` ${nextEvent.event_time}` : ''}
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-slate-500 mt-2">No events yet.</Text>
          )}
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Shopping list</Text>
          <Text className="text-sm text-slate-500 mt-1">
            {shoppingOpen.length} items to grab
          </Text>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Family members</Text>
          <View className="mt-3 gap-2">
            {familyMembers.map((member) => (
              <View key={member.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <Text className="text-slate-900 font-medium">{member.name}</Text>
                <Text className="text-xs text-slate-500 mt-1">{member.role}</Text>
              </View>
            ))}
            {familyMembers.length === 0 && (
              <Text className="text-sm text-slate-500">Invite your family members.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
