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
import { Bell, CheckCircle2, Plus, Users, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createReminder, fetchReminders, toggleReminderStatus } from '@/services/reminders';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';
import type { Reminder } from '@/types';

// Member avatar emojis
const MEMBER_EMOJIS = ['👨', '👩', '👧', '👦', '👴', '👵', '🧑'];

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
        backgroundColor: '#F472B6',
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
        backgroundColor: '#818CF8',
        opacity: 0.1,
      }}
    />
  </>
);

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
      void hapticSuccess();
    } catch (error) {
      void hapticError();
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
      void hapticImpactLight();
    } catch (error) {
      void hapticError();
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
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
                backgroundColor: '#F472B6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Bell size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>Reminders</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                Delegate tasks smartly 🔔
              </Text>
            </View>
          </View>
        </View>

        {/* Create Reminder Card */}
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
              <Plus size={20} color="#F472B6" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Create Reminder
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
              placeholder="Reminder title"
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
              placeholder="Notes (optional)"
              placeholderTextColor="#71717A"
              value={note}
              onChangeText={setNote}
            />
            
            {/* Assignee Selection */}
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Users size={16} color="#A1A1AA" />
                <Text style={{ fontSize: 14, color: '#A1A1AA', marginLeft: 6 }}>Assign to:</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {familyMembers.map((member, index) => (
                  <TouchableOpacity
                    key={member.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: assignee === member.id ? '#F472B6' : '#181A20',
                      borderWidth: 1,
                      borderColor: assignee === member.id ? '#F472B6' : '#3F3F46',
                    }}
                    onPress={() => setAssignee(member.id)}
                  >
                    <Text style={{ marginRight: 6 }}>{MEMBER_EMOJIS[index % MEMBER_EMOJIS.length]}</Text>
                    <Text style={{ color: assignee === member.id ? '#FFFFFF' : '#A1A1AA', fontWeight: '500' }}>
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {familyMembers.length === 0 && (
                  <Text style={{ fontSize: 14, color: '#71717A' }}>No members yet</Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 20,
                borderRadius: 16,
                backgroundColor: '#F472B6',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#F472B6',
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
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Add Reminder</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminders List */}
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
              <AlertCircle size={20} color="#818CF8" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Assigned Reminders
              </Text>
            </View>
            
            {reminders.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
                <Text style={{ fontSize: 14, color: '#71717A' }}>No reminders yet</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {reminders.map((reminder) => {
                  const isDone = reminder.status === 'done';
                  return (
                    <TouchableOpacity
                      key={reminder.id}
                      style={{
                        backgroundColor: isDone ? '#22C55E15' : '#F472B615',
                        borderRadius: 16,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: isDone ? '#22C55E' : '#F472B6',
                      }}
                      onPress={() => handleToggle(reminder)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              color: isDone ? '#71717A' : '#FFFFFF',
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            }}
                          >
                            {reminder.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Text style={{ fontSize: 12, color: isDone ? '#52525B' : '#A1A1AA' }}>
                              {isDone ? '✓ Done' : '○ Pending'}
                            </Text>
                            {reminder.assigned_to && (
                              <Text style={{ fontSize: 12, color: '#71717A', marginLeft: 8 }}>
                                · {assigneeById.get(reminder.assigned_to) ?? 'Assigned'}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Bell size={18} color={isDone ? '#52525B' : '#F472B6'} />
                          <CheckCircle2
                            size={20}
                            color={isDone ? '#22C55E' : '#52525B'}
                            style={{ marginLeft: 8 }}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
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
