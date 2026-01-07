import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuthStore } from '@/store';
import { createEvent, fetchEvents } from '@/services/calendar';
import type { CalendarEvent } from '@/types';

const toDateKey = (value: string) => new Date(value).toISOString().split('T')[0];

export function CalendarScreen() {
  const { family, profile } = useAuthStore();
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
    const marks: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string }> = {};
    events.forEach((event) => {
      const key = toDateKey(event.start_time);
      marks[key] = { marked: true };
    });
    marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#7C3AED' };
    return marks;
  }, [events, selectedDate]);

  const dayEvents = events.filter((event) => toDateKey(event.start_time) === selectedDate);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    if (!title.trim()) {
      Alert.alert('Missing info', 'Enter event title.');
      return;
    }

    try {
      setIsLoading(true);
      const start = new Date(`${selectedDate}T09:00:00`);
      const end = new Date(`${selectedDate}T10:00:00`);
      const created = await createEvent({
        family_id: family.id,
        title: title.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        created_by: profile.id ?? profile.user_id ?? null,
      });
      setEvents((prev) => [...prev, created]);
      setTitle('');
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Calendar</Text>
        <Text className="text-base text-slate-600 mt-1">Plan your family moments.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-4 shadow-sm">
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              todayTextColor: '#7C3AED',
              selectedDayBackgroundColor: '#7C3AED',
              arrowColor: '#7C3AED',
            }}
          />
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">New event</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Event title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Add event</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Events on {selectedDate}</Text>
          <View className="mt-4 gap-3">
            {dayEvents.map((event) => (
              <View key={event.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <Text className="text-slate-900 font-medium">{event.title}</Text>
                <Text className="text-xs text-slate-500 mt-1">
                  {new Date(event.start_time).toLocaleTimeString()}
                </Text>
              </View>
            ))}
            {dayEvents.length === 0 && (
              <Text className="text-sm text-slate-500">No events yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
