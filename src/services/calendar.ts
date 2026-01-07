import { supabase } from './supabase';
import type { CalendarEvent } from '@/types';

export const fetchEvents = async (familyId: string) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('family_id', familyId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data as CalendarEvent[];
};

export const createEvent = async (payload: {
  family_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_by?: string | null;
}) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as CalendarEvent;
};
