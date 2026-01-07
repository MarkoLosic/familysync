/**
 * Supabase Database Types
 * Generated manually based on database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          family_id: string | null
          name: string
          avatar_url: string | null
          role: 'admin' | 'child' | 'parent'
          points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          family_id?: string | null
          name: string
          avatar_url?: string | null
          role?: 'admin' | 'child' | 'parent'
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string | null
          name?: string
          avatar_url?: string | null
          role?: 'admin' | 'child' | 'parent'
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_family_id_fkey'
            columns: ['family_id']
            referencedRelation: 'families'
            referencedColumns: ['id']
          }
        ]
      }
      families: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'families_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      tasks: {
        Row: {
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
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          description?: string | null
          assigned_to?: string | null
          created_by: string
          status?: 'active' | 'pending_approval' | 'completed' | 'rejected'
          category?: 'chore' | 'homework' | 'other'
          points?: number
          due_date?: string | null
          completed_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          assigned_to?: string | null
          created_by?: string
          status?: 'active' | 'pending_approval' | 'completed' | 'rejected'
          category?: 'chore' | 'homework' | 'other'
          points?: number
          due_date?: string | null
          completed_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_family_id_fkey'
            columns: ['family_id']
            referencedRelation: 'families'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_assigned_to_fkey'
            columns: ['assigned_to']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      rewards: {
        Row: {
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
        Insert: {
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
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          points_required?: number
          image_url?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rewards_family_id_fkey'
            columns: ['family_id']
            referencedRelation: 'families'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rewards_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          family_id: string
          title: string
          description: string | null
          event_date: string
          event_time: string | null
          created_by: string
          participants: string[]
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
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
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          created_by?: string
          participants?: string[]
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'calendar_events_family_id_fkey'
            columns: ['family_id']
            referencedRelation: 'families'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'calendar_events_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      shopping_items: {
        Row: {
          id: string
          family_id: string
          title: string
          category: 'food' | 'home' | 'personal' | 'other'
          is_checked: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          category?: 'food' | 'home' | 'personal' | 'other'
          is_checked?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          category?: 'food' | 'home' | 'personal' | 'other'
          is_checked?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'shopping_items_family_id_fkey'
            columns: ['family_id']
            referencedRelation: 'families'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shopping_items_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_reward: {
        Args: {
          p_reward_id: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      task_status: 'pending' | 'completed'
      user_role: 'admin' | 'child'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
