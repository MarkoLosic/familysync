import { supabase } from './supabase';
import type { Task } from '@/types';

export const fetchTasks = async (familyId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Task[];
};

export const createTask = async (payload: {
  family_id: string;
  title: string;
  description?: string;
  points_value?: number;
  assigned_to?: string | null;
  created_by?: string | null;
  task_type?: Task['task_type'];
  due_date?: string | null;
}) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...payload,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Task;
};

export const updateTaskStatus = async (
  taskId: string,
  status: Task['status'],
  extra: Partial<Task> = {}
) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, ...extra })
    .eq('id', taskId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Task;
};
