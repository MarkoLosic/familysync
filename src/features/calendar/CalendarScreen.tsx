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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const toDateKey = (value: string) => value.split('T')[0];

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
        backgroundColor: '#A78BFA',
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
        backgroundColor: '#60A5FA',
        opacity: 0.1,
      }}
    />
  </>
);

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
    const marks: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string; dotColor?: string }> = {};
    events.forEach((event) => {
      const key = toDateKey(event.event_date);
      marks[key] = { marked: true, dotColor: '#A78BFA' };
    });
    marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#7C3AED' };
    return marks;
  }, [events, selectedDate]);

  const dayEvents = events.filter((event) => toDateKey(event.event_date) === selectedDate);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    const profileId = getProfileId(profile);
    if (!profileId) {
      Alert.alert('Create failed', 'Missing profile id.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Missing info', 'Enter event title.');
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
            : 'Try again.';
      Alert.alert('Create failed', message);
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
                backgroundColor: '#A78BFA',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <CalendarDays size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>Calendar</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                Plan your family moments 📅
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Calendar
              markedDates={markedDates}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: '#23262F',
                calendarBackground: '#23262F',
                textSectionTitleColor: '#A1A1AA',
                selectedDayBackgroundColor: '#7C3AED',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#A78BFA',
                dayTextColor: '#FFFFFF',
                textDisabledColor: '#52525B',
                dotColor: '#A78BFA',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#A78BFA',
                monthTextColor: '#FFFFFF',
                indicatorColor: '#A78BFA',
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
              <Plus size={20} color="#A78BFA" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                New Event
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
              placeholder="Event title"
              placeholderTextColor="#71717A"
              value={title}
              onChangeText={setTitle}
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#7C3AED',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#7C3AED',
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
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Add Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Events for Selected Date */}
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
              <Clock size={20} color="#60A5FA" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Events on {selectedDate}
              </Text>
            </View>
            
            {dayEvents.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
                <Text style={{ fontSize: 14, color: '#71717A' }}>No events scheduled</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {dayEvents.map((event, index) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? '#A78BFA20' : '#60A5FA20',
                      borderRadius: 16,
                      padding: 16,
                      borderLeftWidth: 4,
                      borderLeftColor: index % 2 === 0 ? '#A78BFA' : '#60A5FA',
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                      {event.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Clock size={14} color="#A1A1AA" />
                      <Text style={{ fontSize: 13, color: '#A1A1AA', marginLeft: 6 }}>
                        {event.event_time ?? 'All day'}
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
