import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createTask, fetchTasks, updateTaskStatus } from '@/services/tasks';
import { getProfileId } from '@/utils/profile';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';
import type { Task } from '@/types';

const statusLabel = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'To do';
    case 'waiting_approval':
      return 'Awaiting approval';
    case 'completed':
      return 'Completed';
    case 'postponed':
      return 'Postponed';
    default:
      return status;
  }
};

export function TasksScreen() {
  const { family, profile } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('10');
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchTasks(family.id);
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [family?.id]);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    const profileId = getProfileId(profile);
    if (!profileId) {
      Alert.alert('Create failed', 'Missing profile id.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Missing info', 'Enter a task title.');
      return;
    }

    try {
      setIsLoading(true);
      const created = await createTask({
        family_id: family.id,
        title: title.trim(),
        description: description.trim() || undefined,
        points_value: Number(points) || 0,
        created_by: profileId,
      });
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setPoints('10');
      void hapticSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'message' in error
            ? String((error as { message?: string }).message)
            : 'Try again.';
      void hapticError();
      Alert.alert('Create failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (task: Task, nextStatus: Task['status']) => {
    try {
      setIsLoading(true);
      const completedAt =
        nextStatus === 'waiting_approval' || nextStatus === 'completed'
          ? new Date().toISOString()
          : null;
      const approvedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
      const updated = await updateTaskStatus(task.id, nextStatus, {
        completed_at: completedAt,
        approved_at: approvedAt,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      void hapticImpactLight();
    } catch (error) {
      void hapticError();
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Tasks</Text>
        <Text className="text-base text-slate-600 mt-1">Assign and approve family tasks.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">New task</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Task title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Task description"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Points"
            placeholderTextColor="#94A3B8"
            value={points}
            onChangeText={setPoints}
            keyboardType="numeric"
          />
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Add task</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Task list</Text>
          <View className="mt-4 gap-3">
            {tasks.map((task) => (
              <View key={task.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-slate-900 font-medium">{task.title}</Text>
                    <Text className="text-xs text-slate-500 mt-1">{statusLabel(task.status)}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-purple-600 mr-2">
                      {task.points_value ?? 0} pts
                    </Text>
                    <CheckCircle2 size={18} color="#7C3AED" />
                  </View>
                </View>
                <View className="mt-3 flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 items-center rounded-xl bg-emerald-100 py-2"
                    onPress={() => handleStatusUpdate(task, 'completed')}
                    disabled={isLoading}
                  >
                    <Text className="text-emerald-700 font-semibold">Done</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 items-center rounded-xl bg-amber-100 py-2"
                    onPress={() => handleStatusUpdate(task, 'postponed')}
                    disabled={isLoading}
                  >
                    <Text className="text-amber-700 font-semibold">Postpone</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {tasks.length === 0 && (
              <Text className="text-sm text-slate-500">No tasks yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
