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
  let family: Family | null = null;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) {
    throw new Error('Not authenticated. Please sign in again.');
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('create_family_and_join', {
    family_name: name,
  });

  if (rpcError) {
    const message = String(rpcError.message || '').toLowerCase();
    if (rpcError.code === 'PGRST202' || message.includes('function')) {
      const { data, error } = await supabase
        .from('families')
        .insert({ name })
        .select('*')
        .single();

      if (error) {
        const insertMessage = String(error.message || '').toLowerCase();
        if (error.code === '42501' || insertMessage.includes('row level security')) {
          throw new Error('RLS blocked family creation. Check policies on families.');
        }
        throw error;
      }
      family = data as Family;
    } else if (message.includes('not_authenticated')) {
      throw new Error('Not authenticated. Please sign in again.');
    } else {
      throw rpcError;
    }
  } else {
    family = rpcData as Family;
  }

  if (!family) {
    throw new Error('Family creation failed.');
  }

  if (!rpcData) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ family_id: family.id, role: 'member' })
      .eq('id', profileId);

    if (profileError) {
      const message = String(profileError.message || '').toLowerCase();
      if (profileError.code === '42501' || message.includes('row level security')) {
        throw new Error('RLS blocked profile update. Check policies on profiles.');
      }
      throw profileError;
    }
  }

  return { family, inviteCode: family.invite_code ?? inviteCode };
};

export const joinFamily = async (code: string, profile: Profile) => {
  const profileId = getProfileId(profile);
  if (!profileId) throw new Error('Missing profile id');

  const normalizedCode = code.trim().toUpperCase();

  const { data: rpcFamily, error: rpcError } = await supabase.rpc('join_family_by_code', {
    invite: normalizedCode,
  });

  let family: Family | null = (rpcFamily as Family) || null;

  if (!family && (!rpcError || rpcError.code === 'PGRST202')) {
    const { data: familyData } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', normalizedCode)
      .single();

    family = familyData as Family | null;
  }

  if (!family) {
    const { data: inviteData, error: inviteError } = await supabase
      .from('family_invites')
      .select('family_id')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (inviteError && inviteError.code !== '42P01') {
      throw inviteError;
    }

    if (!inviteData) {
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

  if (!rpcFamily) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ family_id: family.id, role: 'member' })
      .eq('id', profileId);

    if (profileError) throw profileError;
  }

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
