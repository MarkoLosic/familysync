import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { Family, Profile } from '@/types';
import { getProfileId } from '@/utils/profile';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  family: Family | null;
  familyMembers: Profile[];
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  refreshProfileAndFamily: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

const emptyState = {
  session: null,
  profile: null,
  family: null,
  familyMembers: [],
  isInitializing: false,
  isLoading: false,
  error: null,
};

const fetchProfileForUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) return data as Profile;

  if (error && !String(error.message).includes('column')) {
    if (error.code !== 'PGRST116') throw error;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fallbackError) {
    if (fallbackError.code === 'PGRST116') return null;
    throw fallbackError;
  }

  return fallbackData as Profile;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...emptyState,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  initialize: async () => {
    try {
      set({ isInitializing: true, error: null });
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        set({ ...emptyState, isInitializing: false });
        // Keep listening for auth state changes.
        supabase.auth.onAuthStateChange(async (_event, session) => {
          set({ session });
          if (session?.user) {
            await get().refreshProfileAndFamily();
          } else {
            set({ profile: null, family: null, familyMembers: [] });
          }
        });
        return;
      }
      set({ session: data.session });
      await get().refreshProfileAndFamily();
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session });
        if (session?.user) {
          await get().refreshProfileAndFamily();
        } else {
          set({ profile: null, family: null, familyMembers: [] });
        }
      });
      set({ isInitializing: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize auth';
      set({ isInitializing: false, error: message });
    }
  },
  refreshProfileAndFamily: async () => {
    let session = get().session;
    if (!session?.user) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      session = data.session;
      set({ session });
    }
    if (!session?.user) return;
    try {
      set({ isLoading: true, error: null });
      const profile = await fetchProfileForUser(session.user.id);
      if (!profile) {
        set({ profile: null, family: null, familyMembers: [], isLoading: false });
        return;
      }

      let family: Family | null = null;
      if (profile.family_id) {
        const { data: familyData } = await supabase
          .from('families')
          .select('*')
          .eq('id', profile.family_id)
          .single();
        family = familyData as Family;

        const { data: membersData } = await supabase
          .from('profiles')
          .select('*')
          .eq('family_id', profile.family_id)
          .order('created_at', { ascending: true });

        set({ familyMembers: (membersData as Profile[]) || [] });
      }

      set({ profile, family, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load profile';
      set({ isLoading: false, error: message });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ ...emptyState });
  },
}));

export const useSession = () => useAuthStore((state) => state.session);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useFamily = () => useAuthStore((state) => state.family);
export const useFamilyMembers = () => useAuthStore((state) => state.familyMembers);
export const useIsAuthenticated = () => {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  return Boolean(session && profile);
};
export const useProfileId = () => {
  const profile = useAuthStore((state) => state.profile);
  return getProfileId(profile);
};
