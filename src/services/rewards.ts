import { supabase } from './supabase';
import type { Profile, Reward, RewardClaim } from '@/types';
import { getProfilePoints } from '@/utils/profile';

export const fetchRewards = async (familyId: string) => {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Reward[];
};

export const createReward = async (payload: {
  family_id: string;
  title: string;
  description?: string;
  cost: number;
  created_by?: string | null;
  icon?: string | null;
  available_count?: number | null;
}) => {
  const { data, error } = await supabase
    .from('rewards')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as Reward;
};

export const claimReward = async (reward: Reward, profile: Profile) => {
  const currentPoints = getProfilePoints(profile);
  if (currentPoints < reward.cost) {
    throw new Error('Not enough points to claim this reward.');
  }

  const { data: claimData, error: claimError } = await supabase
    .from('reward_claims')
    .insert({
      reward_id: reward.id,
      user_id: profile.id ?? profile.user_id,
      family_id: reward.family_id,
      status: 'pending',
    })
    .select('*')
    .single();

  if (claimError) throw claimError;

  const updatedPoints = currentPoints - reward.cost;
  await supabase
    .from('profiles')
    .update({ points: updatedPoints, points_balance: updatedPoints })
    .eq('id', profile.id ?? profile.user_id);

  if (reward.available_count !== null && reward.available_count !== undefined) {
    await supabase
      .from('rewards')
      .update({ available_count: Math.max(0, reward.available_count - 1) })
      .eq('id', reward.id);
  }

  return claimData as RewardClaim;
};
