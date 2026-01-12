import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/store';
import { fetchTasks, updateTaskStatus } from '@/services/tasks';
import { fetchEvents, updateEvent } from '@/services/calendar';
import { deleteShoppingItem, fetchShoppingItems, toggleShoppingItem } from '@/services/shopping';
import { getProfilePoints } from '@/utils/profile';
import type { Task, CalendarEvent, ShoppingItem } from '@/types';

export function HomeScreen() {
  const { profile, family, familyMembers } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [shoppingModalVisible, setShoppingModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');

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

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [family?.id])
  );

  const points = getProfilePoints(profile);
  const nextEvent = events[0];
  const activeTasks = tasks.filter(
    (task) => task.status === 'pending' || task.status === 'waiting_approval'
  );
  const shoppingOpen = shopping.filter((item) => !(item.is_checked ?? false));

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventTime(event.event_time ?? '');
    setEventDescription(event.description ?? '');
    setEventModalVisible(true);
  };

  const closeTaskModal = () => {
    setTaskModalVisible(false);
    setSelectedTask(null);
  };

  const closeEventModal = () => {
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const openShoppingModal = () => {
    setShoppingModalVisible(true);
  };

  const closeShoppingModal = () => {
    setShoppingModalVisible(false);
  };

  const handleTaskStatus = async (task: Task, status: Task['status']) => {
    try {
      setIsLoading(true);
      const updated = await updateTaskStatus(task.id, status);
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      closeTaskModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.';
      Alert.alert('Update failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventUpdate = async () => {
    if (!selectedEvent) return;
    if (!eventTitle.trim()) {
      Alert.alert('Missing info', 'Enter event title.');
      return;
    }
    try {
      setIsLoading(true);
      const updated = await updateEvent(selectedEvent.id, {
        title: eventTitle.trim(),
        event_time: eventTime.trim() || null,
        description: eventDescription.trim() || null,
      });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      closeEventModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.';
      Alert.alert('Update failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingToggle = async (item: ShoppingItem) => {
    try {
      setIsLoading(true);
      await deleteShoppingItem(item.id);
      setShopping((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try again.';
      Alert.alert('Update failed', message);
    } finally {
      setIsLoading(false);
    }
  };

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
                <TouchableOpacity
                  key={task.id}
                  className="bg-slate-50 rounded-2xl px-4 py-3"
                  onPress={() => openTaskModal(task)}
                >
                  <Text className="text-slate-900 font-medium">{task.title}</Text>
                  <Text className="text-xs text-slate-500 mt-1">{task.points_value ?? 0} pts</Text>
                </TouchableOpacity>
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
            <TouchableOpacity className="mt-3" onPress={() => openEventModal(nextEvent)}>
              <Text className="text-slate-900 font-medium">{nextEvent.title}</Text>
              <Text className="text-sm text-slate-500 mt-1">
                {nextEvent.event_date}
                {nextEvent.event_time ? ` ${nextEvent.event_time}` : ''}
              </Text>
            </TouchableOpacity>
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
          <TouchableOpacity
            className="mt-3 self-start rounded-xl bg-slate-100 px-3 py-2"
            onPress={openShoppingModal}
          >
            <Text className="text-sm font-semibold text-slate-700">View list</Text>
          </TouchableOpacity>
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

      <Modal
        visible={taskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeTaskModal}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-slate-900">Update task</Text>
            <Text className="text-base text-slate-700 mt-2">{selectedTask?.title}</Text>
            {selectedTask?.description ? (
              <Text className="text-sm text-slate-500 mt-1">{selectedTask.description}</Text>
            ) : null}
            <View className="mt-4 flex-row gap-2">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl bg-emerald-100 py-3"
                onPress={() => selectedTask && handleTaskStatus(selectedTask, 'completed')}
                disabled={isLoading}
              >
                <Text className="text-emerald-700 font-semibold">Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-xl bg-amber-100 py-3"
                onPress={() => selectedTask && handleTaskStatus(selectedTask, 'postponed')}
                disabled={isLoading}
              >
                <Text className="text-amber-700 font-semibold">Postpone</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="mt-4 items-center py-2" onPress={closeTaskModal}>
              <Text className="text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={eventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEventModal}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-slate-900">Update event</Text>
            <TextInput
              className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
              placeholder="Event title"
              placeholderTextColor="#94A3B8"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <TextInput
              className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
              placeholder="Time (e.g. 09:00)"
              placeholderTextColor="#94A3B8"
              value={eventTime}
              onChangeText={setEventTime}
            />
            <TextInput
              className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
              placeholder="Description (optional)"
              placeholderTextColor="#94A3B8"
              value={eventDescription}
              onChangeText={setEventDescription}
            />
            <TouchableOpacity
              className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
              onPress={handleEventUpdate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Save changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity className="mt-4 items-center py-2" onPress={closeEventModal}>
              <Text className="text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={shoppingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeShoppingModal}
        statusBarTranslucent
        navigationBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-slate-900">Shopping list</Text>
            <Text className="text-sm text-slate-500 mt-1">
              {shoppingOpen.length} items to grab
            </Text>
            <View className="mt-4 gap-2">
              {shoppingOpen.map((item) => (
                <View key={item.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-900 font-medium">{item.title || item.name}</Text>
                    <TouchableOpacity
                      className="rounded-lg bg-rose-100 px-3 py-2"
                      onPress={() => handleShoppingToggle(item)}
                      disabled={isLoading}
                    >
                      <Text className="text-rose-700 font-semibold">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {shoppingOpen.length === 0 && (
                <Text className="text-sm text-slate-500">No items yet.</Text>
              )}
            </View>
            <TouchableOpacity className="mt-4 items-center py-2" onPress={closeShoppingModal}>
              <Text className="text-slate-500">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
