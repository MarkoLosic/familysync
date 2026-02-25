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
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

// Member avatar emojis
const MEMBER_EMOJIS = ['👨', '👩', '👧', '👦', '👴', '👵', '🧑'];

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
        backgroundColor: theme.primary,
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
        backgroundColor: theme.primary,
        opacity: 0.1,
      }}
    />
  </>
);

export function RemindersScreen() {
  const { family, profile, familyMembers } = useAuthStore();
  const { theme } = useTheme();
  const { t } = useI18n();
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
      Alert.alert(t('common.missingInfo'), t('reminders.enterReminderTitle'));
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
      Alert.alert(t('common.createFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
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
      Alert.alert(t('common.updateFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccentCircles theme={theme.colors} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Bell size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>{t('reminders.title')}</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                {t('reminders.subtitle')} 🔔
              </Text>
            </View>
          </View>
        </View>

        {/* Create Reminder Card */}
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
              <Plus size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                {t('reminders.createReminder')}
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
              placeholder={t('reminders.reminderTitle')}
              placeholderTextColor={theme.colors.textMuted}
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
              placeholder={t('common.notesOptional')}
              placeholderTextColor={theme.colors.textMuted}
              value={note}
              onChangeText={setNote}
            />
            
            {/* Assignee Selection */}
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Users size={16} color={theme.colors.textSecondary} />
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginLeft: 6 }}>{t('reminders.assignTo')}</Text>
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
                      backgroundColor: assignee === member.id ? theme.colors.primary : theme.colors.inputBg,
                      borderWidth: 1,
                      borderColor: assignee === member.id ? theme.colors.primary : theme.colors.border,
                    }}
                    onPress={() => setAssignee(member.id)}
                  >
                    <Text style={{ marginRight: 6 }}>{MEMBER_EMOJIS[index % MEMBER_EMOJIS.length]}</Text>
                    <Text style={{ color: assignee === member.id ? '#FFFFFF' : theme.colors.textSecondary, fontWeight: '500' }}>
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {familyMembers.length === 0 && (
                  <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>{t('profile.noMembers')}</Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 20,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                alignItems: 'center',
                ...theme.shadows.card,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{t('reminders.addReminder')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Reminders List */}
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
              <AlertCircle size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                {t('reminders.assignedReminders')}
              </Text>
            </View>
            
            {reminders.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>{t('reminders.noRemindersYet')}</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {reminders.map((reminder) => {
                  const isDone = reminder.status === 'done';
                  return (
                    <TouchableOpacity
                      key={reminder.id}
                      style={{
                        backgroundColor: isDone ? theme.colors.success + '15' : theme.colors.primary + '15',
                        borderRadius: 16,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: isDone ? theme.colors.success : theme.colors.primary,
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
                              color: isDone ? theme.colors.textMuted : theme.colors.text,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                            }}
                          >
                            {reminder.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Text style={{ fontSize: 12, color: isDone ? theme.colors.textMuted : theme.colors.textSecondary }}>
                              {isDone ? `✓ ${t('common.done')}` : `○ ${t('common.pending')}`}
                            </Text>
                            {reminder.assigned_to && (
                              <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginLeft: 8 }}>
                                · {assigneeById.get(reminder.assigned_to) ?? t('reminders.assigned')}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Bell size={18} color={isDone ? theme.colors.textMuted : theme.colors.primary} />
                          <CheckCircle2
                            size={20}
                            color={isDone ? theme.colors.success : theme.colors.textMuted}
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
