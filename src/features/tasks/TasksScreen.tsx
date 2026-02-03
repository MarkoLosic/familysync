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
import { CheckCircle2, ListTodo, Plus, Star, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createTask, fetchTasks, updateTaskStatus } from '@/services/tasks';
import { getProfileId } from '@/utils/profile';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';
import type { Task } from '@/types';

// Status colors
const STATUS_COLORS: Record<Task['status'], { bg: string; text: string; accent: string }> = {
  pending: { bg: '#3B82F620', text: '#60A5FA', accent: '#3B82F6' },
  waiting_approval: { bg: '#F59E0B20', text: '#FBBF24', accent: '#F59E0B' },
  completed: { bg: '#22C55E20', text: '#4ADE80', accent: '#22C55E' },
  postponed: { bg: '#EF444420', text: '#F87171', accent: '#EF4444' },
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Try again.');
  }
  return 'Try again.';
};

const statusLabel = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return '○ To do';
    case 'waiting_approval':
      return '⏳ Awaiting approval';
    case 'completed':
      return '✓ Completed';
    case 'postponed':
      return '⏸ Postponed';
    default:
      return status;
  }
};

// Pastel accent circles decoration
const AccentCircles = () => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#22C55E',
        opacity: 0.12,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 120,
        left: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3B82F6',
        opacity: 0.1,
      }}
    />
  </>
);

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
      Alert.alert('Update failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <AccentCircles />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ListTodo size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>Tasks</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                Assign and approve tasks ✅
              </Text>
            </View>
          </View>
        </View>

        {/* Create Task Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Plus size={20} color="#22C55E" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                New Task
              </Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
              }}
              placeholder="Task title"
              placeholderTextColor="#71717A"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
                marginTop: 12,
              }}
              placeholder="Description (optional)"
              placeholderTextColor="#71717A"
              value={description}
              onChangeText={setDescription}
            />
            
            <View
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: '#3F3F46',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Star size={18} color="#FBBF24" />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#FFFFFF',
                  marginLeft: 10,
                }}
                placeholder="Points"
                placeholderTextColor="#71717A"
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
              />
              <Text style={{ color: '#71717A' }}>pts</Text>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#22C55E',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#22C55E',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Add Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={20} color="#60A5FA" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Task List
              </Text>
            </View>
            
            {tasks.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                <Text style={{ fontSize: 14, color: '#71717A' }}>No tasks yet. Add your first one!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {tasks.map((task) => {
                  const statusColor = STATUS_COLORS[task.status];
                  return (
                    <View
                      key={task.id}
                      style={{
                        backgroundColor: statusColor.bg,
                        borderRadius: 20,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: statusColor.accent,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                            {task.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: statusColor.text, marginTop: 4 }}>
                            {statusLabel(task.status)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Star size={14} color="#FBBF24" fill="#FBBF24" />
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FBBF24', marginLeft: 4 }}>
                            {task.points_value ?? 0}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: '#22C55E20',
                            borderRadius: 12,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#22C55E40',
                          }}
                          onPress={() => handleStatusUpdate(task, 'completed')}
                          disabled={isLoading}
                        >
                          <Text style={{ color: '#4ADE80', fontWeight: '600' }}>✓ Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: '#F59E0B20',
                            borderRadius: 12,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#F59E0B40',
                          }}
                          onPress={() => handleStatusUpdate(task, 'postponed')}
                          disabled={isLoading}
                        >
                          <Text style={{ color: '#FBBF24', fontWeight: '600' }}>⏸ Later</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
