import { supabase } from './supabase';
import type { FridgeNote } from '@/types';

export const fetchFridgeNotes = async (familyId: string) => {
  const { data, error } = await supabase
    .from('fridge_notes')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as FridgeNote[];
};

export const createFridgeNote = async (payload: {
  family_id: string;
  content: string;
  created_by?: string | null;
}) => {
  const { data, error } = await supabase
    .from('fridge_notes')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as FridgeNote;
};

export const deleteFridgeNote = async (noteId: string) => {
  const { error } = await supabase.from('fridge_notes').delete().eq('id', noteId);
  if (error) throw error;
};
