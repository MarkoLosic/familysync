/**
 * Event Modal Component
 * Bottom sheet for adding/editing calendar events
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native'
import { X, Calendar, Clock, Users } from 'lucide-react-native'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../types/app'
import { CalendarEventInsert } from '../../types/database'
import { useAuthStore } from '../../store/authStore'

interface EventModalProps {
  visible: boolean
  onClose: () => void
  onSave: (event: CalendarEventInsert) => Promise<void>
  selectedDate: string
  initialEvent?: CalendarEventInsert & { id?: string }
}

export const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  onSave,
  selectedDate,
  initialEvent,
}) => {
  const userProfile = useAuthStore((state) => state.userProfile)
  const familyMembers = useAuthStore((state) => state.familyMembers)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState(selectedDate)
  const [eventTime, setEventTime] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens/closes or initialEvent changes
  useEffect(() => {
    if (visible) {
      if (initialEvent) {
        setTitle(initialEvent.title || '')
        setDescription(initialEvent.description || '')
        setEventDate(initialEvent.event_date || selectedDate)
        setEventTime(initialEvent.event_time || '')
        setSelectedParticipants(initialEvent.participants || [])
      } else {
        setTitle('')
        setDescription('')
        setEventDate(selectedDate)
        setEventTime('')
        setSelectedParticipants([])
      }
    }
  }, [visible, initialEvent, selectedDate])

  const toggleParticipant = (profileId: string) => {
    setSelectedParticipants((prev) =>
      (Array.isArray(prev) ? prev : []).includes(profileId)
        ? (Array.isArray(prev) ? prev : []).filter((id) => id !== profileId)
        : [...(Array.isArray(prev) ? prev : []), profileId]
    )
  }

  const handleSave = async () => {
    if (!title.trim() || !userProfile?.family_id) return

    setLoading(true)
    try {
      const event: CalendarEventInsert = {
        family_id: userProfile.family_id,
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        event_time: eventTime || null,
        created_by: userProfile.id,
        participants: selectedParticipants,
        color: COLORS.primary,
      }

      await onSave(event)
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: '90%' }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-6 py-4 border-b"
            style={{ borderBottomColor: COLORS.border }}
          >
            <Text
              className="text-xl font-bold"
              style={{ color: COLORS.text.primary }}
            >
              {initialEvent ? 'Edit Event' : 'New Event'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4">
            {/* Title Input */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                Event Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="E.g., Soccer Practice, Doctor Appointment"
                placeholderTextColor={COLORS.text.tertiary}
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: COLORS.surface.secondary,
                  color: COLORS.text.primary,
                  fontSize: TYPOGRAPHY.body.fontSize,
                }}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details..."
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: COLORS.surface.secondary,
                  color: COLORS.text.primary,
                  fontSize: TYPOGRAPHY.body.fontSize,
                  minHeight: 80,
                }}
              />
            </View>

            {/* Date Display */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color={COLORS.text.secondary} />
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  Date
                </Text>
              </View>
              <View
                className="px-4 py-3 rounded-2xl"
                style={{ backgroundColor: COLORS.surface.secondary }}
              >
                <Text style={{ color: COLORS.text.primary }}>
                  {new Date(eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {/* Time Input */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Clock size={16} color={COLORS.text.secondary} />
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  Time (Optional)
                </Text>
              </View>
              <TextInput
                value={eventTime}
                onChangeText={setEventTime}
                placeholder="E.g., 3:00 PM, 15:00"
                placeholderTextColor={COLORS.text.tertiary}
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: COLORS.surface.secondary,
                  color: COLORS.text.primary,
                  fontSize: TYPOGRAPHY.body.fontSize,
                }}
              />
            </View>

            {/* Participants */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Users size={16} color={COLORS.text.secondary} />
                <Text
                  className="text-sm font-semibold ml-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  Who's Involved?
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {familyMembers.map((member) => {
                  const participants = Array.isArray(selectedParticipants)
                    ? selectedParticipants
                    : []
                  const isSelected = participants.includes(member.id)
                  return (
                    <TouchableOpacity
                      key={member.id}
                      onPress={() => toggleParticipant(member.id)}
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: isSelected
                          ? COLORS.primary
                          : COLORS.surface.secondary,
                      }}
                    >
                      <Text
                        className="font-medium"
                        style={{
                          color: isSelected
                            ? '#FFFFFF'
                            : COLORS.text.primary,
                        }}
                      >
                        {member.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View
            className="px-6 py-4 border-t flex-row gap-3"
            style={{ borderTopColor: COLORS.border }}
          >
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-4 rounded-2xl"
              style={{ backgroundColor: COLORS.surface.secondary }}
            >
              <Text
                className="text-center font-semibold"
                style={{ color: COLORS.text.primary }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!title.trim() || loading}
              className="flex-1 py-4 rounded-2xl"
              style={{
                backgroundColor:
                  !title.trim() || loading
                    ? COLORS.text.tertiary
                    : COLORS.primary,
              }}
            >
              <Text className="text-center font-semibold text-white">
                {loading ? 'Saving...' : 'Save Event'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
