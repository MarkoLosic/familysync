import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CalendarDays, Plus, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createEvent, fetchEvents } from '@/services/calendar';
import { getProfileId } from '@/utils/profile';
import { hapticError, hapticSuccess } from '@/utils/haptics';
import type { CalendarEvent } from '@/types';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const toDateKey = (value: string) => value.split('T')[0];

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
        backgroundColor: theme.colors.primaryLight,
        opacity: 0.15,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 80,
        left: -70,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: theme.colors.greenLight,
        opacity: 0.1,
      }}
    />
  </>
);

export function CalendarScreen() {
  const { family, profile } = useAuthStore();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchEvents(family.id);
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [family?.id]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string; dotColor?: string }> = {};
    events.forEach((event) => {
      const key = toDateKey(event.event_date);
      marks[key] = { marked: true, dotColor: theme.colors.primary };
    });
    marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: theme.colors.primary };
    return marks;
  }, [events, selectedDate, theme]);

  const dayEvents = events.filter((event) => toDateKey(event.event_date) === selectedDate);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    const profileId = getProfileId(profile);
    if (!profileId) {
      Alert.alert(t('common.createFailed'), t('common.missingProfileId'));
      return;
    }
    if (!title.trim()) {
      Alert.alert(t('common.missingInfo'), t('calendar.enterEventTitle'));
      return;
    }

    try {
      setIsLoading(true);
      const eventTime = '09:00';
      const created = await createEvent({
        family_id: family.id,
        title: title.trim(),
        event_date: selectedDate,
        event_time: eventTime,
        created_by: profileId,
      });
      setEvents((prev) => [...prev, created]);
      setTitle('');
      void hapticSuccess();
    } catch (error) {
      void hapticError();
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error && 'message' in error
            ? String((error as { message?: string }).message)
            : t('common.tryAgain');
      Alert.alert(t('common.createFailed'), message);
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
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <CalendarDays size={24} color={theme.colors.card} />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>{t('calendar.title')}</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                {t('calendar.subtitle')} 📅
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 16,
              ...theme.shadows.card,
            }}
          >
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: theme.colors.card,
                calendarBackground: theme.colors.card,
                textSectionTitleColor: theme.colors.textSecondary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.card,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text,
                textDisabledColor: theme.colors.textMuted,
                dotColor: theme.colors.primary,
                selectedDotColor: theme.colors.card,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text,
                indicatorColor: theme.colors.primary,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
              }}
            />
          </View>
        </View>

        {/* New Event Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
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
                {t('calendar.newEvent')}
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
              placeholder={t('calendar.eventTitle')}
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                alignItems: 'center',
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={{ color: theme.colors.card, fontWeight: '600', fontSize: 16 }}>{t('calendar.addEvent')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Events for Selected Date */}
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
              <Clock size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                {t('calendar.eventsOn')} {selectedDate}
              </Text>
            </View>
            
            {dayEvents.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>{t('calendar.noEventsScheduled')}</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {dayEvents.map((event, index) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? theme.colors.primaryLight : theme.colors.greenLight,
                      borderRadius: 16,
                      padding: 16,
                      borderLeftWidth: 4,
                      borderLeftColor: index % 2 === 0 ? theme.colors.primary : theme.colors.success,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                      {event.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Clock size={14} color={theme.colors.textSecondary} />
                      <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginLeft: 6 }}>
                        {event.event_time ?? t('calendar.allDay')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
