import type { Profile } from '@/types';

export const getProfileId = (profile: Profile | null) => {
  if (!profile) return null;
  return profile.id ?? profile.user_id ?? null;
};

export const getProfilePoints = (profile: Profile | null) => {
  if (!profile) return 0;
  const points = profile.points_balance ?? profile.points ?? 0;
  return typeof points === 'number' ? points : 0;
};
