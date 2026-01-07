/**
 * Gamification Service Usage Examples
 * Various patterns for claiming rewards
 */

import { Alert } from 'react-native'
import { claimReward, canAffordReward, pointsNeeded, RewardClaimError } from '@/services/gamification'
import { useAuthStore } from '@/store'
import type { Reward } from '@/types'

// ============================================
// EXAMPLE 1: Simple Button Handler (Minimal)
// ============================================

export const simpleClaimHandler = async (rewardId: string) => {
  try {
    const newBalance = await claimReward(rewardId)
    await useAuthStore.getState().fetchProfileAndFamily()
    Alert.alert('Success!', `New balance: ${newBalance} points`)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      Alert.alert('Error', error.message)
    }
  }
}

// Usage:
// <Button onPress={() => simpleClaimHandler(reward.id)} />

// ============================================
// EXAMPLE 2: With Confirmation Dialog
// ============================================

export const claimWithConfirmation = (reward: Reward) => {
  Alert.alert(
    'Claim Reward',
    `Claim "${reward.title}" for ${reward.points_required} points?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Claim',
        onPress: async () => {
          try {
            const newBalance = await claimReward(reward.id)
            await useAuthStore.getState().fetchProfileAndFamily()
            Alert.alert('🎉 Success!', `New balance: ${newBalance} points`)
          } catch (error) {
            if (error instanceof RewardClaimError) {
              Alert.alert('Error', error.message)
            }
          }
        },
      },
    ]
  )
}

// Usage:
// <Button onPress={() => claimWithConfirmation(reward)} />

// ============================================
// EXAMPLE 3: With Pre-validation
// ============================================

export const claimWithValidation = async (
  reward: Reward,
  userPoints: number
) => {
  // Check if user can afford before calling RPC
  if (!canAffordReward(userPoints, reward.points_required)) {
    const needed = pointsNeeded(userPoints, reward.points_required)
    Alert.alert(
      'Not Enough Points',
      `You need ${needed} more points to claim this reward!`
    )
    return
  }

  // Check if reward is active
  if (!reward.is_active) {
    Alert.alert('Unavailable', 'This reward is no longer available')
    return
  }

  try {
    const newBalance = await claimReward(reward.id)
    await useAuthStore.getState().fetchProfileAndFamily()
    Alert.alert('Success!', `New balance: ${newBalance} points`)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      Alert.alert('Error', error.message)
    }
  }
}

// Usage:
// const profile = useAuthStore((state) => state.profile)
// <Button onPress={() => claimWithValidation(reward, profile.points)} />

// ============================================
// EXAMPLE 4: With Loading State & Callbacks
// ============================================

export const claimWithCallbacks = async (
  rewardId: string,
  options: {
    onStart?: () => void
    onSuccess?: (newBalance: number) => void
    onError?: (error: RewardClaimError) => void
    onFinally?: () => void
  }
) => {
  try {
    options.onStart?.()

    const newBalance = await claimReward(rewardId)
    await useAuthStore.getState().fetchProfileAndFamily()

    options.onSuccess?.(newBalance)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      options.onError?.(error)
    }
  } finally {
    options.onFinally?.()
  }
}

// Usage:
// const [isLoading, setIsLoading] = useState(false)
//
// <Button
//   onPress={() => claimWithCallbacks(reward.id, {
//     onStart: () => setIsLoading(true),
//     onSuccess: (balance) => Alert.alert('Success!', `New balance: ${balance}`),
//     onError: (error) => Alert.alert('Error', error.message),
//     onFinally: () => setIsLoading(false),
//   })}
// />

// ============================================
// EXAMPLE 5: Custom Error Messages
// ============================================

export const claimWithCustomErrors = async (
  rewardId: string,
  rewardTitle: string
) => {
  try {
    const newBalance = await claimReward(rewardId)
    await useAuthStore.getState().fetchProfileAndFamily()

    // Custom success message
    Alert.alert(
      '🎉 Reward Claimed!',
      `You've successfully claimed "${rewardTitle}"!\n\nYour new balance is ${newBalance} points.`,
      [{ text: 'Awesome!', style: 'default' }]
    )
  } catch (error) {
    if (error instanceof RewardClaimError) {
      // Custom error messages based on error code
      switch (error.code) {
        case 'INSUFFICIENT_POINTS':
          Alert.alert(
            '🪙 Need More Points',
            `You don't have enough points to claim "${rewardTitle}". Complete more tasks to earn points!`,
            [{ text: 'Got it', style: 'default' }]
          )
          break

        case 'REWARD_INACTIVE':
          Alert.alert(
            '😞 Reward Unavailable',
            `Sorry, "${rewardTitle}" is no longer available. Check out other rewards in the shop!`,
            [{ text: 'OK', style: 'default' }]
          )
          break

        case 'REWARD_NOT_FOUND':
          Alert.alert(
            '❓ Not Found',
            `This reward no longer exists.`,
            [{ text: 'OK', style: 'default' }]
          )
          break

        default:
          Alert.alert(
            '❌ Error',
            `Failed to claim reward: ${error.message}`,
            [{ text: 'OK', style: 'default' }]
          )
      }
    } else {
      Alert.alert(
        '❌ Unexpected Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK', style: 'default' }]
      )
    }
  }
}

// Usage:
// <Button onPress={() => claimWithCustomErrors(reward.id, reward.title)} />

// ============================================
// EXAMPLE 6: Batch Claim (Multiple Rewards)
// ============================================

export const claimMultipleRewards = async (rewardIds: string[]) => {
  const results = {
    success: [] as string[],
    failed: [] as { id: string; error: string }[],
  }

  for (const rewardId of rewardIds) {
    try {
      await claimReward(rewardId)
      results.success.push(rewardId)
    } catch (error) {
      results.failed.push({
        id: rewardId,
        error: error instanceof RewardClaimError ? error.message : 'Unknown error',
      })
    }
  }

  // Refresh profile once at the end
  await useAuthStore.getState().fetchProfileAndFamily()

  // Show results
  if (results.failed.length === 0) {
    Alert.alert('Success!', `Claimed ${results.success.length} rewards!`)
  } else {
    Alert.alert(
      'Partial Success',
      `Claimed ${results.success.length} rewards.\nFailed: ${results.failed.length}`
    )
  }

  return results
}

// Usage (not common, but possible):
// <Button onPress={() => claimMultipleRewards([reward1.id, reward2.id])} />

// ============================================
// EXAMPLE 7: With Toast Notifications
// (Assumes you have a toast library like react-native-toast-message)
// ============================================

// import Toast from 'react-native-toast-message'

export const claimWithToast = async (reward: Reward) => {
  try {
    const newBalance = await claimReward(reward.id)
    await useAuthStore.getState().fetchProfileAndFamily()

    // Show success toast
    // Toast.show({
    //   type: 'success',
    //   text1: '🎉 Reward Claimed!',
    //   text2: `${reward.title} • New balance: ${newBalance} points`,
    //   visibilityTime: 4000,
    // })
  } catch (error) {
    if (error instanceof RewardClaimError) {
      // Show error toast
      // Toast.show({
      //   type: 'error',
      //   text1: 'Failed to claim reward',
      //   text2: error.message,
      //   visibilityTime: 3000,
      // })
    }
  }
}

// ============================================
// EXAMPLE 8: With Analytics Tracking
// ============================================

export const claimWithAnalytics = async (
  reward: Reward,
  analytics: any // Your analytics service (e.g., Firebase Analytics)
) => {
  try {
    // Track attempt
    analytics.logEvent('reward_claim_attempt', {
      reward_id: reward.id,
      reward_title: reward.title,
      points_required: reward.points_required,
    })

    const newBalance = await claimReward(reward.id)
    await useAuthStore.getState().fetchProfileAndFamily()

    // Track success
    analytics.logEvent('reward_claim_success', {
      reward_id: reward.id,
      reward_title: reward.title,
      points_spent: reward.points_required,
      new_balance: newBalance,
    })

    Alert.alert('Success!', `New balance: ${newBalance} points`)
  } catch (error) {
    if (error instanceof RewardClaimError) {
      // Track failure
      analytics.logEvent('reward_claim_failure', {
        reward_id: reward.id,
        reward_title: reward.title,
        error_code: error.code,
        error_message: error.message,
      })

      Alert.alert('Error', error.message)
    }
  }
}

// ============================================
// HELPER: Check if user can claim
// ============================================

export const canClaimReward = (reward: Reward, userPoints: number): boolean => {
  return reward.is_active && canAffordReward(userPoints, reward.points_required)
}

// Usage:
// const profile = useAuthStore((state) => state.profile)
// const canClaim = canClaimReward(reward, profile.points)
//
// <Button
//   disabled={!canClaim}
//   onPress={() => simpleClaimHandler(reward.id)}
// />
