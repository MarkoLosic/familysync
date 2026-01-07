/**
 * Gamification Service
 * Handles rewards, points, and gamification logic
 */

import { supabase } from './supabase'
import type { Tables } from '@/types'

/**
 * Error types for reward claiming
 */
export class RewardClaimError extends Error {
  constructor(
    message: string,
    public code: 'INSUFFICIENT_POINTS' | 'REWARD_INACTIVE' | 'REWARD_NOT_FOUND' | 'UNKNOWN'
  ) {
    super(message)
    this.name = 'RewardClaimError'
  }
}

/**
 * Response from the claim_reward RPC function
 */
export interface ClaimRewardResponse {
  success: boolean
  new_balance: number
  message?: string
}

/**
 * Claim a reward by calling the Supabase RPC function
 * This function handles the transaction safely on the backend
 * 
 * @param rewardId - The ID of the reward to claim
 * @returns Promise with the new points balance
 * @throws RewardClaimError if the claim fails
 * 
 * @example
 * ```typescript
 * try {
 *   const newBalance = await claimReward('reward-id-123')
 *   console.log('Reward claimed! New balance:', newBalance)
 * } catch (error) {
 *   if (error instanceof RewardClaimError) {
 *     switch (error.code) {
 *       case 'INSUFFICIENT_POINTS':
 *         alert('You need more points to claim this reward!')
 *         break
 *       case 'REWARD_INACTIVE':
 *         alert('This reward is no longer available')
 *         break
 *       default:
 *         alert('Failed to claim reward')
 *     }
 *   }
 * }
 * ```
 */
export async function claimReward(rewardId: string): Promise<number> {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) throw userError
    if (!user) {
      throw new RewardClaimError('User not authenticated', 'UNKNOWN')
    }

    // Call the Supabase RPC function to claim the reward
    // This handles the transaction atomically on the backend
    const { data, error } = await supabase.rpc('claim_reward', {
      p_reward_id: rewardId,
      p_user_id: user.id,
    })

    if (error) {
      console.error('RPC claim_reward error:', error)

      // Parse error message to determine the type
      const errorMessage = error.message || error.toString() || ''
      
      if (errorMessage.includes('insufficient points')) {
        throw new RewardClaimError(
          'You do not have enough points to claim this reward',
          'INSUFFICIENT_POINTS'
        )
      } else if (errorMessage.includes('inactive') || errorMessage.includes('not active')) {
        throw new RewardClaimError(
          'This reward is no longer available',
          'REWARD_INACTIVE'
        )
      } else if (errorMessage.includes('not found')) {
        throw new RewardClaimError(
          'Reward not found',
          'REWARD_NOT_FOUND'
        )
      }

      // Generic error
      throw new RewardClaimError(
        error.message || 'Failed to claim reward',
        'UNKNOWN'
      )
    }

    // Parse the response from the RPC function
    const response = data as unknown as ClaimRewardResponse

    if (!response.success) {
      throw new RewardClaimError(
        response.message || 'Failed to claim reward',
        'UNKNOWN'
      )
    }

    // Return the new balance
    return response.new_balance
  } catch (error) {
    // Re-throw RewardClaimError as-is
    if (error instanceof RewardClaimError) {
      throw error
    }

    // Wrap other errors
    console.error('Unexpected error claiming reward:', error)
    throw new RewardClaimError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'UNKNOWN'
    )
  }
}

/**
 * Get all active rewards for a family
 * 
 * @param familyId - The family ID to fetch rewards for
 * @returns Promise with array of active rewards
 */
export async function getActiveRewards(familyId: string): Promise<Tables<'rewards'>[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('family_id', familyId)
    .eq('is_active', true)
    .order('points_required', { ascending: true })

  if (error) {
    console.error('Error fetching rewards:', error)
    throw new Error('Failed to fetch rewards')
  }

  return data || []
}

/**
 * Get all rewards for a family (including inactive)
 * 
 * @param familyId - The family ID to fetch rewards for
 * @returns Promise with array of all rewards
 */
export async function getAllRewards(familyId: string): Promise<Tables<'rewards'>[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('family_id', familyId)
    .order('points_required', { ascending: true })

  if (error) {
    console.error('Error fetching all rewards:', error)
    throw new Error('Failed to fetch rewards')
  }

  return data || []
}

/**
 * Check if a user can afford a reward
 * 
 * @param userPoints - Current user points
 * @param rewardPoints - Points required for the reward
 * @returns boolean indicating if user can afford the reward
 */
export function canAffordReward(userPoints: number, rewardPoints: number): boolean {
  return userPoints >= rewardPoints
}

/**
 * Calculate points needed to claim a reward
 * 
 * @param userPoints - Current user points
 * @param rewardPoints - Points required for the reward
 * @returns Points needed (0 if user can already afford it)
 */
export function pointsNeeded(userPoints: number, rewardPoints: number): number {
  const needed = rewardPoints - userPoints
  return needed > 0 ? needed : 0
}

/**
 * Award points to a user (typically after task completion)
 * 
 * @param userId - The user profile ID
 * @param points - Points to award
 * @returns Promise with the new balance
 */
export async function awardPoints(userId: string, points: number): Promise<number> {
  try {
    // Fetch current points
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const newBalance = profile.points + points

    // Update points
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: newBalance })
      .eq('id', userId)

    if (updateError) throw updateError

    return newBalance
  } catch (error) {
    console.error('Error awarding points:', error)
    throw new Error('Failed to award points')
  }
}

/**
 * Create a new reward (admin only)
 * 
 * @param reward - The reward data to insert
 * @returns Promise with the created reward
 */
export async function createReward(reward: {
  family_id: string
  title: string
  description?: string
  points_required: number
  image_url?: string
  created_by: string
}): Promise<Tables<'rewards'>> {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      ...reward,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating reward:', error)
    throw new Error('Failed to create reward')
  }

  return data
}
