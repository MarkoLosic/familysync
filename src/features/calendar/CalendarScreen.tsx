/**
 * Calendar Screen
 * Family shared calendar with Agenda view
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Agenda, DateData, AgendaEntry, AgendaSchedule } from 'react-native-calendars'
import { Plus, Calendar as CalendarIcon } from 'lucide-react-native'
import { COLORS, SPACING } from '../../types/app'
import { useAuthStore } from '../../store/authStore'
import { CalendarEvent, CalendarEventInsert, Profile } from '../../types/database'
import {
  getFamilyEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from '../../services/calendar'
import { EventModal } from './EventModal'

interface AgendaItem extends AgendaEntry {
  event: CalendarEvent
}

export const CalendarScreen: React.FC = () => {
  const userProfile = useAuthStore((state) => state.userProfile)
  const familyMembers = useAuthStore((state) => state.familyMembers)

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [items, setItems] = useState<AgendaSchedule>({})
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [markedDates, setMarkedDates] = useState<any>({})

  // Load events on mount
  useEffect(() => {
    if (userProfile?.family_id) {
      loadEvents()
    }
  }, [userProfile?.family_id])

  // Load all family events
  const loadEvents = async () => {
    if (!userProfile?.family_id) return

    try {
      setLoading(true)
      const familyEvents = await getFamilyEvents(userProfile.family_id)
      setEvents(familyEvents)
      processEventsForAgenda(familyEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      Alert.alert('Error', 'Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  // Process events into Agenda format
  const processEventsForAgenda = (events: CalendarEvent[]) => {
    const agendaItems: AgendaSchedule = {}
    const marked: any = {}

    events.forEach((event) => {
      const dateKey = event.event_date

      // Add to agenda items
      if (!agendaItems[dateKey]) {
        agendaItems[dateKey] = []
      }

      agendaItems[dateKey].push({
        name: event.title,
        height: 80,
        event: event,
      } as AgendaItem)

      // Add to marked dates (dots)
      if (!marked[dateKey]) {
        marked[dateKey] = { dots: [] }
      }

      // Color dot by first participant or default color
      const participantColor = getParticipantColor(event.participants[0])
      marked[dateKey].dots.push({
        key: event.id,
        color: participantColor,
      })
    })

    setItems(agendaItems)
    setMarkedDates(marked)
  }

  // Get color for a participant
  const getParticipantColor = (profileId: string) => {
    const member = familyMembers.find((m) => m.id === profileId)
    if (!member) return COLORS.primary

    // Assign colors based on member index
    const colors = [
      COLORS.primary,
      COLORS.secondary,
      COLORS.success,
      COLORS.warning,
      COLORS.error,
    ]
    const memberIndex = familyMembers.findIndex((m) => m.id === profileId)
    return colors[memberIndex % colors.length]
  }

  // Handle creating a new event
  const handleCreateEvent = async (eventData: CalendarEventInsert) => {
    try {
      await createCalendarEvent(eventData)
      await loadEvents() // Reload events
      Alert.alert('Success', 'Event created successfully!')
    } catch (error) {
      console.error('Error creating event:', error)
      Alert.alert('Error', 'Failed to create event')
    }
  }

  // Handle deleting an event (long press)
  const handleDeleteEvent = (event: CalendarEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCalendarEvent(event.id)
              await loadEvents()
              Alert.alert('Success', 'Event deleted successfully!')
            } catch (error) {
              console.error('Error deleting event:', error)
              Alert.alert('Error', 'Failed to delete event')
            }
          },
        },
      ]
    )
  }

  // Render agenda item
  const renderItem = (reservation: AgendaEntry) => {
    const item = reservation as AgendaItem
    if (!item.event) {
      return <View />
    }
    
    const event = item.event
    const participantNames = event.participants
      .map((id) => familyMembers.find((m: Profile) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ')

    const participantColor = getParticipantColor(event.participants[0])

    return (
      <TouchableOpacity
        onLongPress={() => handleDeleteEvent(event)}
        className="mr-4 mt-4 p-4 rounded-3xl"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          borderLeftWidth: 4,
          borderLeftColor: participantColor,
        }}
      >
        <Text
          className="text-lg font-bold mb-1"
          style={{ color: COLORS.text.primary }}
        >
          {event.title}
        </Text>
        {event.event_time && (
          <Text className="text-sm mb-1" style={{ color: COLORS.text.secondary }}>
            🕐 {event.event_time}
          </Text>
        )}
        {event.description && (
          <Text
            className="text-sm mb-2"
            style={{ color: COLORS.text.secondary }}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}
        {participantNames && (
          <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>
            👥 {participantNames}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  // Render empty date
  const renderEmptyDate = () => {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <CalendarIcon size={48} color={COLORS.text.tertiary} />
        <Text className="mt-2 text-center" style={{ color: COLORS.text.tertiary }}>
          No events for this day
        </Text>
      </View>
    )
  }

  // Handle day press
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        className="px-6 pt-16 pb-4 flex-row items-center justify-between"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <View>
          <Text className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
            Calendar
          </Text>
          <Text className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            Family events & activities
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setSelectedDate(new Date().toISOString().split('T')[0])
            setModalVisible(true)
          }}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Agenda Calendar */}
      <Agenda
        items={items}
        selected={selectedDate}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        onDayPress={handleDayPress}
        showClosingKnob
        markingType="multi-dot"
        markedDates={markedDates}
        theme={{
          backgroundColor: COLORS.background,
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: COLORS.text.secondary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text.primary,
          textDisabledColor: COLORS.text.tertiary,
          dotColor: COLORS.primary,
          selectedDotColor: '#FFFFFF',
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.text.primary,
          indicatorColor: COLORS.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
          agendaDayTextColor: COLORS.text.primary,
          agendaDayNumColor: COLORS.text.primary,
          agendaTodayColor: COLORS.primary,
          agendaKnobColor: COLORS.primary,
        }}
      />

      {/* Event Modal */}
      <EventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateEvent}
        selectedDate={selectedDate}
      />
    </View>
  )
}
