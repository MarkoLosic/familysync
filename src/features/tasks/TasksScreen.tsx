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
import { useTheme } from '@/theme';

// Status colors function
const getStatusColors = (theme: any) => ({
  pending: { bg: theme.colors.primaryLight, text: theme.colors.primary, accent: theme.colors.primary },
  waiting_approval: { bg: theme.colors.orangeLight, text: theme.colors.warning, accent: theme.colors.warning },
  completed: { bg: theme.colors.greenLight, text: theme.colors.success, accent: theme.colors.success },
  postponed: { bg: theme.colors.error + '20', text: theme.colors.error, accent: theme.colors.error },
});

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
const AccentCircles = ({ theme }: { theme: any }) => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: theme.colors.greenLight,
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
        backgroundColor: theme.colors.primaryLight,
        opacity: 0.1,
      }}
    />
  </>
);

export function TasksScreen() {
  const { family, profile } = useAuthStore();
  const { theme } = useTheme();
  const statusColors = getStatusColors(theme);
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccentCircles theme={theme} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ListTodo size={24} color={theme.colors.card} />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>Tasks</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                Assign and approve tasks ✅
              </Text>
            </View>
          </View>
        </View>

        {/* Create Task Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Plus size={20} color={theme.colors.success} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                New Task
              </Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="Task title"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginTop: 12,
              }}
              placeholder="Description (optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
            
            <View
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Star size={18} color={theme.colors.warning} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.text,
                  marginLeft: 10,
                }}
                placeholder="Points"
                placeholderTextColor={theme.colors.textSecondary}
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
              />
              <Text style={{ color: theme.colors.textSecondary }}>pts</Text>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.success,
                paddingVertical: 14,
                alignItems: 'center',
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={{ color: theme.colors.card, fontWeight: '600', fontSize: 16 }}>Add Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <CheckCircle2 size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                Task List
              </Text>
            </View>
            
            {tasks.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>No tasks yet. Add your first one!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {tasks.map((task) => {
                  const statusColor = statusColors[task.status];
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
                          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                            {task.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: statusColor.text, marginTop: 4 }}>
                            {statusLabel(task.status)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Star size={14} color={theme.colors.warning} fill={theme.colors.warning} />
                          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.warning, marginLeft: 4 }}>
                            {task.points_value ?? 0}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Action Buttons */}
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: theme.colors.greenLight,
                            borderRadius: 12,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: theme.colors.success + '40',
                          }}
                          onPress={() => handleStatusUpdate(task, 'completed')}
                          disabled={isLoading}
                        >
                          <Text style={{ color: theme.colors.success, fontWeight: '600' }}>✓ Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            backgroundColor: theme.colors.orangeLight,
                            borderRadius: 12,
                            paddingVertical: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: theme.colors.warning + '40',
                          }}
                          onPress={() => handleStatusUpdate(task, 'postponed')}
                          disabled={isLoading}
                        >
                          <Text style={{ color: theme.colors.warning, fontWeight: '600' }}>⏸ Later</Text>
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
