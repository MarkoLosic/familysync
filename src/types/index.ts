/**
 * Types - Main exports
 * Central export point for all types
 */

// Database types
export type {
  Family,
  Profile,
  Task,
  Reward,
  FamilyInsert,
  ProfileInsert,
  TaskInsert,
  RewardInsert,
  FamilyUpdate,
  ProfileUpdate,
  TaskUpdate,
  RewardUpdate,
  TaskWithProfiles,
  ProfileWithFamily,
  RewardWithCreator,
  FamilyWithMembers,
  ApiResponse,
  PaginatedResponse,
} from './database'

// App types and enums
export {
  UserRole,
  TaskStatus,
  RewardStatus,
  isUserRole,
  isTaskStatus,
  isAdmin,
  isChild,
  isTaskCompleted,
  isTaskPending,
  COLORS,
  DEFAULT_POINTS,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from './app'

export type {
  TaskFilter,
  TaskSort,
  RewardFilter,
  RewardSort,
  NavigationParams,
  TaskFormData,
  RewardFormData,
  ProfileFormData,
  FamilyFormData,
  UserStats,
  FamilyStats,
  TaskStats,
  LoadingProps,
  ErrorProps,
  EmptyStateProps,
  TaskEvent,
  RewardEvent,
  ActivityEvent,
  Notification,
} from './app'

// Supabase types (keep for compatibility)
export type { Tables, Inserts, Updates, Enums, Database } from './supabase'
