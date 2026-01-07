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
import { Bell, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createReminder, fetchReminders, toggleReminderStatus } from '@/services/reminders';
import type { Reminder } from '@/types';

export function RemindersScreen() {
  const { family, profile, familyMembers } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [assignee, setAssignee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const assigneeById = new Map(familyMembers.map((member) => [member.id, member.name]));

  const loadReminders = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchReminders(family.id);
      setReminders(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [family?.id]);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    if (!title.trim()) {
      Alert.alert('Missing info', 'Enter reminder title.');
      return;
    }

    try {
      setIsLoading(true);
      const created = await createReminder({
        family_id: family.id,
        title: title.trim(),
        note: note.trim() || undefined,
        assigned_to: assignee,
        created_by: profile.id ?? profile.user_id ?? null,
      });
      setReminders((prev) => [created, ...prev]);
      setTitle('');
      setNote('');
      setAssignee(null);
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (reminder: Reminder) => {
    try {
      setIsLoading(true);
      const updated = await toggleReminderStatus(reminder);
      setReminders((prev) => prev.map((item) => (item.id === reminder.id ? updated : item)));
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Reminders</Text>
        <Text className="text-base text-slate-600 mt-1">Delegate tasks with smart reminders.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Create reminder</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Reminder title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Notes (optional)"
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
          />
          <View className="mt-3 flex-row flex-wrap gap-2">
            {familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                className={`rounded-2xl px-3 py-2 ${assignee === member.id ? 'bg-purple-600' : 'bg-slate-100'}`}
                onPress={() => setAssignee(member.id)}
              >
                <Text className={assignee === member.id ? 'text-white' : 'text-slate-700'}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
            {familyMembers.length === 0 && (
              <Text className="text-sm text-slate-500">No members yet.</Text>
            )}
          </View>
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Add reminder</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Assigned reminders</Text>
          <View className="mt-4 gap-3">
            {reminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.id}
                className="bg-slate-50 rounded-2xl px-4 py-3"
                onPress={() => handleToggle(reminder)}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-slate-900 font-medium">{reminder.title}</Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      {reminder.status === 'pending' ? 'Pending' : 'Done'}{' '}
                      {reminder.assigned_to
                        ? `· ${assigneeById.get(reminder.assigned_to) ?? 'Assigned'}`
                        : ''}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Bell size={18} color="#7C3AED" />
                    <CheckCircle2
                      size={18}
                      color={reminder.status === 'done' ? '#16A34A' : '#94A3B8'}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {reminders.length === 0 && (
              <Text className="text-sm text-slate-500">No reminders yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
