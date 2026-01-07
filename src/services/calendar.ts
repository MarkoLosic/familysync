/**
 * Calendar Service
 * Handles calendar events CRUD operations
 */

import { supabase } from './supabase'
import { CalendarEvent, CalendarEventInsert } from '../types/database'

/**
 * Get all calendar events for a family
 */
export async function getFamilyEvents(
  familyId: string
): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('family_id', familyId)
      .order('event_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching family events:', error)
    throw error
  }
}

/**
 * Get calendar events for a specific date range
 */
export async function getEventsInRange(
  familyId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('family_id', familyId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching events in range:', error)
    throw error
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  event: CalendarEventInsert
): Promise<CalendarEvent> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CalendarEventInsert>
): Promise<CalendarEvent> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

/**
 * Get events for a specific date
 */
export async function getEventsForDate(
  familyId: string,
  date: string
): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('family_id', familyId)
      .eq('event_date', date)
      .order('event_time', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching events for date:', error)
    throw error
  }
}
