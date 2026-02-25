import { supabase } from './supabase';
import type { FamilyLocation } from '@/types';

const normalizeLocationError = (error: { message?: string; details?: string; hint?: string } | null) => {
  const details = [error?.message, error?.details, error?.hint].filter(Boolean).join(' | ');
  const raw = details || 'Failed to update location';
  const lower = raw.toLowerCase();

  if (lower.includes('family_locations') && (lower.includes('does not exist') || lower.includes('not found'))) {
    return 'Nedostaje tabela public.family_locations. Pokreni SQL iz supabase/family_locations.sql u Supabase SQL Editor-u.';
  }

  return raw;
};

export const fetchFamilyLocations = async (familyId: string) => {
  const { data, error } = await supabase
    .from('family_locations')
    .select('*')
    .eq('family_id', familyId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(normalizeLocationError(error));
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
    .upsert(payload, { onConflict: 'family_id,user_id' })
    .select('*')
    .single();

  if (error) throw new Error(normalizeLocationError(error));
  return data as FamilyLocation;
};
