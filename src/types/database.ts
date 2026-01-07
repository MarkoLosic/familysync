/**
 * Database Types
 * TypeScript interfaces matching Supabase tables exactly
 */

// ============================================
// Database Tables
// ============================================

/**
 * Families Table
 * Represents a family group
 */
export interface Family {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Profiles Table
 * User profile linked to auth.users
 */
export interface Profile {
  id: string // Primary key, references auth.users(id)
  family_id: string | null
  name: string // The actual column name in database
  avatar_url: string | null
  role: 'admin' | 'child' | 'parent'
  points: number
  level?: number // Optional field that may exist in database
  created_at: string
  updated_at: string
}

/**
 * Tasks Table
 * Tasks assigned to family members
 */
export interface Task {
  id: string
  family_id: string
  title: string
  description: string | null
  assigned_to: string | null
  created_by: string
  status: 'active' | 'pending_approval' | 'completed' | 'rejected'
  category: 'chore' | 'homework' | 'other'
  points: number
  due_date: string | null
  completed_at: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  // Relations (from joins)
  assigned_to_profile?: {
    id: string
    name: string
    role: 'admin' | 'child' | 'parent'
  } | null
  created_by_profile?: {
    id: string
    name: string
  } | null
}

/**
 * Rewards Table
 * Rewards that can be claimed with points
 */
export interface Reward {
  id: string
  family_id: string
  title: string
  description: string | null
  points_required: number
  image_url: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Calendar Events Table
 * Family calendar events
 */
export interface CalendarEvent {
  id: string
  family_id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  created_by: string
  participants: string[] // Array of profile IDs
  color: string | null
  created_at: string
  updated_at: string
  // Relations (from joins)
  created_by_profile?: {
    id: string
    username: string
  }
  participant_profiles?: Array<{
    id: string
    username: string
    role: 'parent' | 'child'
  }>
}

/**
 * Shopping List Item Table
 * Real-time collaborative shopping list
 */
export interface ShoppingItem {
  id: string
  family_id: string
  title: string
  category: 'food' | 'home' | 'personal' | 'other'
  is_checked: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Relations (from joins)
  created_by_profile?: {
    id: string
    username: string
  }
}

// ============================================
// Insert Types (for creating new records)
// ============================================

export interface FamilyInsert {
  id?: string
  name: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface ProfileInsert {
  id?: string
  user_id: string
  family_id?: string | null
  username: string
  avatar_url?: string | null
  role?: 'admin' | 'child'
  points?: number
  created_at?: string
  updated_at?: string
}

export interface TaskInsert {
  id?: string
  family_id: string
  title: string
  description?: string | null
  assigned_to?: string | null
  created_by: string
  status?: 'pending' | 'completed'
  points?: number
  due_date?: string | null
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface RewardInsert {
  id?: string
  family_id: string
  title: string
  description?: string | null
  points_required: number
  image_url?: string | null
  is_active?: boolean
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface CalendarEventInsert {
  id?: string
  family_id: string
  title: string
  description?: string | null
  event_date: string
  event_time?: string | null
  created_by: string
  participants?: string[]
  color?: string | null
  created_at?: string
  updated_at?: string
}

export interface ShoppingItemInsert {
  id?: string
  family_id: string
  title: string
  category?: 'food' | 'home' | 'personal' | 'other'
  is_checked?: boolean
  created_by: string
  created_at?: string
  updated_at?: string
}

// ============================================
// Update Types (for updating records)
// ============================================

export interface FamilyUpdate {
  name?: string
  updated_at?: string
}

export interface ProfileUpdate {
  family_id?: string | null
  name?: string
  avatar_url?: string | null
  role?: 'admin' | 'child'
  points?: number
  updated_at?: string
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  assigned_to?: string | null
  status?: 'pending' | 'completed'
  points?: number
  due_date?: string | null
  completed_at?: string | null
  updated_at?: string
}

export interface RewardUpdate {
  title?: string
  description?: string | null
  points_required?: number
  image_url?: string | null
  is_active?: boolean
  updated_at?: string
}

export interface CalendarEventUpdate {
  title?: string
  description?: string | null
  event_date?: string
  event_time?: string | null
  participants?: string[]
  color?: string | null
  updated_at?: string
}

export interface ShoppingItemUpdate {
  title?: string
  category?: 'food' | 'home' | 'personal' | 'other'
  is_checked?: boolean
  updated_at?: string
}

// ============================================
// Extended Types (with relations)
// ============================================

/**
 * Task with assigned user profile and creator profile
 */
export interface TaskWithProfiles extends Omit<Task, 'assigned_to_profile' | 'created_by_profile'> {
  assigned_to_profile?: Profile | null
  created_by_profile?: Profile
}

/**
 * Profile with family details
 */
export interface ProfileWithFamily extends Profile {
  family?: Family | null
}

/**
 * Reward with creator profile
 */
export interface RewardWithCreator extends Reward {
  creator?: Profile
}

/**
 * Family with all members
 */
export interface FamilyWithMembers extends Family {
  members?: Profile[]
}

/**
 * Calendar event with creator profile and participant profiles
 */
export interface CalendarEventWithProfiles extends Omit<CalendarEvent, 'created_by_profile' | 'participant_profiles'> {
  created_by_profile?: Profile
  participant_profiles?: Profile[]
}

/**
 * Shopping item with creator profile
 */
export interface ShoppingItemWithCreator extends ShoppingItem {
  creator?: Profile
}

// ============================================
// Response Types
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
