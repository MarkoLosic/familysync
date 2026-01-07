/**
 * Authentication Store
 * Manages user session, profile, and family data using Zustand
 */

import { create } from 'zustand'
import type { User as AuthUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { Profile, Family } from '@/types/database'
import { UserRole } from '@/types/app'

interface AuthState {
  // Core State
  session: Session | null
  userProfile: Profile | null
  familyDetails: Family | null
  familyMembers: Profile[]
  
  // Loading States
  isLoading: boolean
  isInitializing: boolean
  isFetchingProfile: boolean
  isFetchingFamily: boolean
  
  // Error State
  error: string | null

  // Actions
  setSession: (session: Session | null) => void
  setUserProfile: (profile: Profile | null) => void
  setFamilyDetails: (family: Family | null) => void
  setFamilyMembers: (members: Profile[]) => void
  fetchProfileAndFamily: () => Promise<void>
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  reset: () => void
  
  // Computed Properties
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  hasFamily: () => boolean
}

const initialState = {
  session: null,
  userProfile: null,
  familyDetails: null,
  familyMembers: [],
  isLoading: false,
  isInitializing: false,
  isFetchingProfile: false,
  isFetchingFamily: false,
  error: null,
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setSession: (session) => set({ session }),

  setUserProfile: (userProfile) => set({ userProfile }),

  setFamilyDetails: (familyDetails) => set({ familyDetails }),
  
  setFamilyMembers: (familyMembers) => set({ familyMembers }),

  /**
   * Initialize auth state on app start
   * Checks for existing session and loads profile/family
   */
  initialize: async () => {
    try {
      set({ isInitializing: true, error: null })

      // Check for existing session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (session) {
        set({ session })
        await get().fetchProfileAndFamily()
      }

      set({ isInitializing: false })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize auth'
      console.error('Error initializing auth:', errorMessage)
      set({ isInitializing: false, error: errorMessage })
    }
  },

  /**
   * Fetch user profile and associated family data
   * Should be called after successful login/signup
   */
  fetchProfileAndFamily: async () => {
    try {
      set({ isLoading: true, isFetchingProfile: true, error: null })

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError
      if (!session?.user) {
        throw new Error('No authenticated user found')
      }

      set({ session })

      // Fetch user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        // Handle case where profile doesn't exist yet
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found for user:', session.user.id)
          set({
            isLoading: false,
            isFetchingProfile: false,
            userProfile: null,
            familyDetails: null,
          })
          return
        }
        throw profileError
      }

      set({ userProfile: profileData, isFetchingProfile: false })

      // Fetch family data if user belongs to a family
      if (profileData.family_id) {
        set({ isFetchingFamily: true })

        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('*')
          .eq('id', profileData.family_id)
          .single()

        if (familyError) {
          console.error('Error fetching family:', familyError)
          // Don't throw - family might have been deleted
          set({ familyDetails: null, isFetchingFamily: false })
        } else {
          set({ familyDetails: familyData, isFetchingFamily: false })
          
          // Fetch family members
          const { data: membersData, error: membersError } = await supabase
            .from('profiles')
            .select('*')
            .eq('family_id', profileData.family_id)
          
          if (!membersError && membersData) {
            set({ familyMembers: membersData })
          }
        }
      } else {
        // User hasn't joined a family yet
        set({ familyDetails: null, familyMembers: [], isFetchingFamily: false })
      }

      set({ isLoading: false, error: null })
    } catch (error) {
      console.error('Error in fetchProfileAndFamily:', error)
      
      // Safely extract error message
      let errorMessage = 'Failed to fetch profile and family'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message)
      }
      
      set({
        isLoading: false,
        isFetchingProfile: false,
        isFetchingFamily: false,
        error: errorMessage,
      })
      throw error
    }
  },

  /**
   * Sign out the current user and reset the store
   */
  signOut: async () => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      get().reset()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign out'
      console.error('Error signing out:', errorMessage)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  /**
   * Reset the store to initial state
   */
  reset: () => set(initialState),

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return get().session !== null && get().userProfile !== null
  },

  /**
   * Check if user is an admin (parent)
   */
  isAdmin: () => {
    return get().userProfile?.role === UserRole.ADMIN
  },

  /**
   * Check if user has joined a family
   */
  hasFamily: () => {
    return get().familyDetails !== null
  },
}))

// ============================================
// Selector Hooks (for convenience)
// ============================================

/**
 * Get current session
 */
export const useSession = () => useAuthStore((state) => state.session)

/**
 * Get current user profile
 */
export const useUserProfile = () => useAuthStore((state) => state.userProfile)

/**
 * Get current family details
 */
export const useFamilyDetails = () => useAuthStore((state) => state.familyDetails)

/**
 * Get loading states
 */
export const useAuthLoading = () => ({
  isLoading: useAuthStore((state) => state.isLoading),
  isInitializing: useAuthStore((state) => state.isInitializing),
  isFetchingProfile: useAuthStore((state) => state.isFetchingProfile),
  isFetchingFamily: useAuthStore((state) => state.isFetchingFamily),
})

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const session = useAuthStore((state) => state.session)
  const userProfile = useAuthStore((state) => state.userProfile)
  return session !== null && userProfile !== null
}

/**
 * Check if user is admin (parent)
 */
export const useIsAdmin = () => {
  const userProfile = useAuthStore((state) => state.userProfile)
  return userProfile?.role === UserRole.ADMIN
}

/**
 * Check if user has a family
 */
export const useHasFamily = () => {
  const familyDetails = useAuthStore((state) => state.familyDetails)
  return familyDetails !== null
}

/**
 * Get user's points
 */
export const useUserPoints = () => {
  const userProfile = useAuthStore((state) => state.userProfile)
  return userProfile?.points || 0
}

/**
 * Get user's role
 */
export const useUserRole = () => {
  const userProfile = useAuthStore((state) => state.userProfile)
  return userProfile?.role || null
}
