import type {
  RewardClaimStatus,
  ShoppingCategory,
  TaskCategory,
  TaskStatus,
  UserRole,
} from './app';

export type Profile = {
  id: string;
  user_id?: string;
  email?: string | null;
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
  points?: number | null;
  assigned_to?: string | null;
  created_by?: string | null;
  status: TaskStatus;
  category?: TaskCategory | null;
  due_date?: string | null;
  completed_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string;
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
  status: RewardClaimStatus;
  claimed_at?: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
};

export type CalendarEvent = {
  id: string;
  family_id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
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
