import { supabase } from './supabase';
import type { Reminder } from '@/types';

export const fetchReminders = async (familyId: string) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Reminder[];
};

export const createReminder = async (payload: {
  family_id: string;
  title: string;
  note?: string;
  assigned_to?: string | null;
  created_by?: string | null;
  due_at?: string | null;
}) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      ...payload,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Reminder;
};

export const toggleReminderStatus = async (reminder: Reminder) => {
  const next = reminder.status === 'pending' ? 'done' : 'pending';
  const { data, error } = await supabase
    .from('reminders')
    .update({ status: next })
    .eq('id', reminder.id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Reminder;
};
