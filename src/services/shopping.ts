/**
 * Shopping List Service
 * Real-time shopping list operations with Supabase
 */

import { supabase } from './supabase'
import { ShoppingItem, ShoppingItemInsert } from '../types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Get all shopping items for a family
 */
export async function getFamilyShoppingItems(
  familyId: string
): Promise<ShoppingItem[]> {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('family_id', familyId)
      .order('is_checked', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching shopping items:', error)
    throw error
  }
}

/**
 * Create a new shopping item
 */
export async function createShoppingItem(
  item: ShoppingItemInsert
): Promise<ShoppingItem> {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating shopping item:', error)
    throw error
  }
}

/**
 * Toggle shopping item checked status
 */
export async function toggleShoppingItem(
  itemId: string,
  isChecked: boolean
): Promise<ShoppingItem> {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .update({ is_checked: isChecked })
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error toggling shopping item:', error)
    throw error
  }
}

/**
 * Delete a shopping item
 */
export async function deleteShoppingItem(itemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting shopping item:', error)
    throw error
  }
}

/**
 * Subscribe to real-time shopping list changes
 */
export function subscribeToShoppingList(
  familyId: string,
  callbacks: {
    onInsert?: (item: ShoppingItem) => void
    onUpdate?: (item: ShoppingItem) => void
    onDelete?: (itemId: string) => void
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`shopping_items:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'shopping_items',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        console.log('Shopping item inserted:', payload.new)
        if (callbacks.onInsert) {
          callbacks.onInsert(payload.new as ShoppingItem)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'shopping_items',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        console.log('Shopping item updated:', payload.new)
        if (callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as ShoppingItem)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'shopping_items',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        console.log('Shopping item deleted:', payload.old)
        if (callbacks.onDelete) {
          callbacks.onDelete((payload.old as ShoppingItem).id)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from shopping list channel
 */
export function unsubscribeFromShoppingList(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}
