/**
 * Application Types
 * Enums, constants, and app-specific types
 */

// ============================================
// Enums
// ============================================

/**
 * User Role Enum
 * Defines the role of a user in a family
 */
export enum UserRole {
  ADMIN = 'admin',  // Parent/Guardian with full permissions
  CHILD = 'child',  // Child with limited permissions
}

/**
 * Task Status Enum
 * Defines the current state of a task
 */
export enum TaskStatus {
  PENDING = 'pending',      // Task not yet completed
  COMPLETED = 'completed',  // Task completed
}

/**
 * Reward Status Enum
 * Defines if a reward is available
 */
export enum RewardStatus {
  ACTIVE = 'active',      // Reward can be claimed
  INACTIVE = 'inactive',  // Reward not available
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if a value is a valid UserRole
 */
export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole)
}

/**
 * Check if a value is a valid TaskStatus
 */
export function isTaskStatus(value: string): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus)
}

/**
 * Check if user is an admin
 */
export function isAdmin(role: UserRole | string): boolean {
  return role === UserRole.ADMIN
}

/**
 * Check if user is a child
 */
export function isChild(role: UserRole | string): boolean {
  return role === UserRole.CHILD
}

/**
 * Check if task is completed
 */
export function isTaskCompleted(status: TaskStatus | string): boolean {
  return status === TaskStatus.COMPLETED
}

/**
 * Check if task is pending
 */
export function isTaskPending(status: TaskStatus | string): boolean {
  return status === TaskStatus.PENDING
}

// ============================================
// UI-Specific Types
// ============================================

/**
 * Filter options for task lists
 */
export type TaskFilter = 'all' | 'pending' | 'completed' | 'my-tasks'

/**
 * Sort options for task lists
 */
export type TaskSort = 'newest' | 'oldest' | 'points-high' | 'points-low' | 'due-date'

/**
 * Filter options for rewards
 */
export type RewardFilter = 'all' | 'active' | 'affordable' | 'wishlist'

/**
 * Sort options for rewards
 */
export type RewardSort = 'points-low' | 'points-high' | 'newest' | 'oldest'

/**
 * Navigation params for screens
 */
export interface NavigationParams {
  TaskDetail?: {
    taskId: string
  }
  RewardDetail?: {
    rewardId: string
  }
  ProfileDetail?: {
    profileId: string
  }
  EditTask?: {
    taskId?: string
  }
  EditReward?: {
    rewardId?: string
  }
}

// ============================================
// Form Types
// ============================================

/**
 * Form data for creating/editing a task
 */
export interface TaskFormData {
  title: string
  description: string
  assigned_to: string | null
  points: number
  due_date: Date | null
}

/**
 * Form data for creating/editing a reward
 */
export interface RewardFormData {
  title: string
  description: string
  points_required: number
  image_url: string | null
  is_active: boolean
}

/**
 * Form data for creating/editing a profile
 */
export interface ProfileFormData {
  name: string
  avatar_url: string | null
  role: UserRole
}

/**
 * Form data for creating a family
 */
export interface FamilyFormData {
  name: string
}

// ============================================
// Statistics Types
// ============================================

/**
 * User statistics
 */
export interface UserStats {
  totalPoints: number
  tasksCompleted: number
  tasksAssigned: number
  rewardsClaimed: number
  rank?: number
}

/**
 * Family statistics
 */
export interface FamilyStats {
  totalMembers: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalPoints: number
  activeRewards: number
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number
  completed: number
  pending: number
  completionRate: number
  averagePoints: number
}

// ============================================
// Component Props Types
// ============================================

/**
 * Common loading state props
 */
export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
}

/**
 * Common error state props
 */
export interface ErrorProps {
  error: string | null
  onRetry?: () => void
}

/**
 * Common empty state props
 */
export interface EmptyStateProps {
  title: string
  message: string
  icon?: React.ComponentType<any>
  actionLabel?: string
  onAction?: () => void
}

// ============================================
// Event Types
// ============================================

/**
 * Task events for activity feed
 */
export type TaskEvent = {
  type: 'task_created' | 'task_completed' | 'task_assigned'
  taskId: string
  taskTitle: string
  userId: string
  userName: string
  timestamp: string
  points?: number
}

/**
 * Reward events for activity feed
 */
export type RewardEvent = {
  type: 'reward_claimed' | 'reward_created'
  rewardId: string
  rewardTitle: string
  userId: string
  userName: string
  timestamp: string
  pointsSpent?: number
}

/**
 * Union of all event types
 */
export type ActivityEvent = TaskEvent | RewardEvent

// ============================================
// Notification Types
// ============================================

/**
 * In-app notification
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// ============================================
// Constants
// ============================================

/**
 * Color palette matching Super Design
 */
export const COLORS = {
  // Primary Colors
  primary: '#6ee7b7', // Mint green
  secondary: '#fb7185', // Coral
  accent: '#60a5fa', // Sky blue
  
  // Pastels
  mint: {
    light: '#86efac',
    DEFAULT: '#6ee7b7',
    dark: '#34d399',
  },
  coral: {
    light: '#fca5a5',
    DEFAULT: '#fb7185',
    dark: '#f87171',
  },
  sky: {
    light: '#7dd3fc',
    DEFAULT: '#60a5fa',
    dark: '#3b82f6',
  },
  // Neutrals
  slate: {
    light: '#475569',
    DEFAULT: '#334155',
    dark: '#1e293b',
  },
  gray: {
    light: '#f8fafc',
    DEFAULT: '#f1f5f9',
    dark: '#cbd5e1',
  },
  
  // Semantic Colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Text Colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
  },
  
  // Surface Colors
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },
  
  // Background
  background: '#f8fafc',
  
  // Border
  border: '#e2e8f0',
} as const

/**
 * Spacing scale
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

/**
 * Border radius scale
 */
export const BORDER_RADIUS = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const

/**
 * Default point values
 */
export const DEFAULT_POINTS = {
  TASK_EASY: 25,
  TASK_MEDIUM: 50,
  TASK_HARD: 100,
  REWARD_SMALL: 50,
  REWARD_MEDIUM: 100,
  REWARD_LARGE: 200,
} as const

/**
 * Role display names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Parent',
  [UserRole.CHILD]: 'Child',
}

/**
 * Task status display names
 */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.COMPLETED]: 'Completed',
}

/**
 * Status colors for UI
 */
export const STATUS_COLORS = {
  [TaskStatus.PENDING]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: '#d97706',
  },
  [TaskStatus.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: '#16a34a',
  },
} as const
