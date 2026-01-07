import { supabase } from './supabase';
import type { FamilyLocation } from '@/types';

export const fetchFamilyLocations = async (familyId: string) => {
  const { data, error } = await supabase
    .from('family_locations')
    .select('*')
    .eq('family_id', familyId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as FamilyLocation[];
};

export const upsertLocation = async (payload: {
  family_id: string;
  user_id: string;
  status: FamilyLocation['status'];
  lat?: number | null;
  lng?: number | null;
}) => {
  const { data, error } = await supabase
    .from('family_locations')
    .upsert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as FamilyLocation;
};
