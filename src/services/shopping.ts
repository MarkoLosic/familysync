import { supabase } from './supabase';
import type { ShoppingItem } from '@/types';

export const fetchShoppingItems = async (familyId: string) => {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ShoppingItem[];
};

export const createShoppingItem = async (payload: {
  family_id: string;
  title: string;
  category?: string;
  created_by?: string | null;
}) => {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data as ShoppingItem;
};

export const toggleShoppingItem = async (item: ShoppingItem) => {
  const current = item.is_checked ?? item.is_purchased ?? false;
  const { data, error } = await supabase
    .from('shopping_items')
    .update({ is_checked: !current, is_purchased: !current })
    .eq('id', item.id)
    .select('*')
    .single();

  if (error) throw error;
  return data as ShoppingItem;
};
