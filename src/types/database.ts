import type { ShoppingCategory, TaskCategory, TaskStatus, UserRole, LocationStatus } from './app';

export type Profile = {
  id: string;
  user_id?: string;
  email?: string | null;
  username?: string | null;
  name: string;
  role: UserRole;
  family_id: string | null;
  points?: number | null;
  points_balance?: number | null;
  level?: number | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Family = {
  id: string;
  name: string;
  invite_code?: string | null;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Task = {
  id: string;
  family_id: string;
  title: string;
  description?: string | null;
  points_value?: number | null;
  assigned_to?: string | null;
  created_by?: string | null;
  status: TaskStatus;
  task_type?: TaskCategory | null;
  due_date?: string | null;
  completed_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CalendarEvent = {
  id: string;
  family_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  status?: 'pending' | 'done';
};

export type ShoppingItem = {
  id: string;
  family_id: string;
  title?: string;
  name?: string;
  quantity?: number | null;
  category?: ShoppingCategory | string | null;
  is_checked?: boolean | null;
  is_purchased?: boolean | null;
  created_by?: string | null;
  added_by?: string | null;
  purchased_by?: string | null;
  purchased_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FamilyLocation = {
  id: string;
  family_id: string;
  user_id: string;
  status: LocationStatus;
  lat?: number | null;
  lng?: number | null;
  updated_at?: string;
};

export type Reward = {
  id: string;
  family_id: string;
  title: string;
  description?: string | null;
  cost: number;
  icon?: string | null;
  available_count?: number | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RewardClaim = {
  id: string;
  reward_id: string;
  user_id: string;
  family_id: string;
  status: 'pending' | 'approved' | 'denied';
  claimed_at?: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
};

export type Reminder = {
  id: string;
  family_id: string;
  title: string;
  note?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  status: 'pending' | 'done';
  due_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FridgeNote = {
  id: string;
  family_id: string;
  content: string;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};
