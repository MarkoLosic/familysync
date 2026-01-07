import { supabase } from './supabase';
import type { Family, Profile } from '@/types';
import { getProfileId } from '@/utils/profile';

const INVITE_CODE_LENGTH = 6;

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const createFamily = async (name: string, profile: Profile) => {
  const profileId = getProfileId(profile);
  if (!profileId) throw new Error('Missing profile id');

  const inviteCode = generateInviteCode();
  const insertPayload = {
    name,
    created_by: profileId,
    invite_code: inviteCode,
  };

  let family: Family | null = null;

  const { data, error } = await supabase
    .from('families')
    .insert(insertPayload)
    .select('*')
    .single();

  if (!error) {
    family = data as Family;
  } else if (String(error.message).includes('invite_code')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('families')
      .insert({ name, created_by: profileId })
      .select('*')
      .single();

    if (fallbackError) throw fallbackError;
    family = fallbackData as Family;

    await supabase
      .from('family_invites')
      .insert({
        family_id: family.id,
        code: inviteCode,
        created_by: profileId,
      });
  } else {
    throw error;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ family_id: family.id, role: 'admin' })
    .eq('id', profileId);

  if (profileError) throw profileError;

  return { family, inviteCode: family.invite_code ?? inviteCode };
};

export const joinFamily = async (code: string, profile: Profile) => {
  const profileId = getProfileId(profile);
  if (!profileId) throw new Error('Missing profile id');

  const normalizedCode = code.trim().toUpperCase();

  const { data: familyData } = await supabase
    .from('families')
    .select('*')
    .eq('invite_code', normalizedCode)
    .single();

  let family: Family | null = familyData as Family | null;

  if (!family) {
    const { data: inviteData, error: inviteError } = await supabase
      .from('family_invites')
      .select('family_id')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (inviteError || !inviteData) {
      throw new Error('Invalid or expired invite code');
    }

    const { data: familyByInvite, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('id', inviteData.family_id)
      .single();

    if (familyError || !familyByInvite) {
      throw new Error('Family not found');
    }

    family = familyByInvite as Family;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ family_id: family.id, role: 'child' })
    .eq('id', profileId);

  if (profileError) throw profileError;

  return family;
};

export const leaveFamily = async (profile: Profile) => {
  const profileId = getProfileId(profile);
  if (!profileId) throw new Error('Missing profile id');

  const { error } = await supabase
    .from('profiles')
    .update({ family_id: null })
    .eq('id', profileId);

  if (error) throw error;
};

export const getFamilyMembers = async (familyId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Profile[];
};
