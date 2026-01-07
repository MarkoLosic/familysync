/**
 * Family Service
 * Handles family creation, joining, and invite code management
 */

import { supabase } from './supabase'
import type { Family, Profile, ProfileUpdate } from '@/types/database'

/**
 * Generate a random 6-character invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous characters
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new family and set the creator as admin
 * 
 * @param name - Family name
 * @param userId - Auth user ID
 * @returns Family data with invite code
 */
export async function createFamily(name: string, userId: string): Promise<{
  family: Family
  inviteCode: string
}> {
  try {
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile) throw new Error('Profile not found')

    // Generate invite code
    const inviteCode = generateInviteCode()

    // Create family with invite code
    // Note: You'll need to add invite_code column to families table in Supabase
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        name,
        created_by: profile.id,
      })
      .select()
      .single()

    if (familyError) throw familyError

    // Update profile with family_id and set role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        family_id: family.id,
        role: 'admin' as const,
      })
      .eq('id', profile.id)

    if (updateError) throw updateError

    // Store invite code in family metadata or separate table
    // For now, we'll store it in a custom metadata field or you can create a separate invite_codes table
    // This is a simple approach - you might want to store it separately for security
    
    return {
      family,
      inviteCode,
    }
  } catch (error) {
    console.error('Error creating family:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create family'
    )
  }
}

/**
 * Join an existing family using invite code
 * 
 * Note: This is a simplified version. In production, you should:
 * 1. Add an 'invite_code' column to the families table in Supabase
 * 2. Or create a separate 'family_invites' table to manage invite codes
 * 3. Store invite codes securely and handle expiration
 * 
 * For now, this function expects the family ID to be passed directly
 * or you can implement invite code lookup using RPC functions
 * 
 * @param familyId - Family ID to join
 * @param userId - Auth user ID
 * @returns Family data
 */
export async function joinFamily(familyId: string, userId: string): Promise<Family> {
  try {
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile) throw new Error('Profile not found')

    // Check if user already has a family
    if (profile.family_id) {
      throw new Error('You are already part of a family')
    }

    // Get family details
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single()

    if (familyError) throw familyError
    if (!family) throw new Error('Family not found')

    // Update profile with family_id and set role to child
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        family_id: family.id,
        role: 'child' as const,
      })
      .eq('id', profile.id)

    if (updateError) throw updateError

    return family
  } catch (error) {
    console.error('Error joining family:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to join family'
    )
  }
}

/**
 * Join a family using an invite code
 * 
 * ⚠️ IMPLEMENTATION REQUIRED ⚠️
 * 
 * To use invite codes, you need to set up one of these options in Supabase:
 * 
 * Option 1: Add invite_code column to families table
 * - Add column: `invite_code TEXT UNIQUE NOT NULL`
 * - Update createFamily to store the code
 * - Query families by invite_code here
 * 
 * Option 2: Create family_invites table
 * - CREATE TABLE family_invites (id, family_id, code, is_active, expires_at)
 * - Store invite codes with expiration
 * - Query family_invites and join to families
 * 
 * Option 3: Use Supabase RPC function
 * - CREATE FUNCTION get_family_by_invite_code(code TEXT) RETURNS uuid
 * - Implement secure lookup logic
 * - Call via supabase.rpc()
 * 
 * @param inviteCode - 6-character invite code
 * @param userId - Auth user ID
 * @returns Family data
 */
export async function joinFamilyByInviteCode(inviteCode: string, userId: string): Promise<Family> {
  try {
    // TODO: Implement invite code lookup
    // This is a placeholder implementation
    
    throw new Error(
      'Invite code feature requires database setup. ' +
      'Please add invite code storage to Supabase (see function documentation). ' +
      'For now, use joinFamily(familyId, userId) directly.'
    )
    
    // Example implementation once invite_code column is added to families:
    /*
    const { data: family, error } = await supabase
      .from('families')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()
    
    if (error || !family) {
      throw new Error('Invalid invite code')
    }
    
    return await joinFamily(family.id, userId)
    */
  } catch (error) {
    console.error('Error joining family by invite code:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to join family'
    )
  }
}

/**
 * Leave current family
 * 
 * @param userId - Auth user ID
 */
export async function leaveFamily(userId: string): Promise<void> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError
    if (!profile) throw new Error('Profile not found')

    if (!profile.family_id) {
      throw new Error('You are not part of any family')
    }

    // Update profile to remove family
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        family_id: null,
      })
      .eq('id', profile.id)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error leaving family:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to leave family'
    )
  }
}

/**
 * Get family members
 * 
 * @param familyId - Family ID
 * @returns Array of profiles
 */
export async function getFamilyMembers(familyId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('family_id', familyId)
    .order('role', { ascending: false }) // Admins first
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching family members:', error)
    throw new Error('Failed to fetch family members')
  }

  return data || []
}
