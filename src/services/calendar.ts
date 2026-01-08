import { supabase } from './supabase';
import type { CalendarEvent } from '@/types';

export const fetchEvents = async (familyId: string) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('family_id', familyId)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data as CalendarEvent[];
};

export const createEvent = async (payload: {
  family_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  created_by: string;
}) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as CalendarEvent;
};

export const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', eventId)
    .select('*')
    .single();

  if (error) throw error;
  return data as CalendarEvent;
};
