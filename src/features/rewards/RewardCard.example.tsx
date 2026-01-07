/**
 * Reward Card Component Example
 * Demonstrates how to use the claimReward function
 */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import { Award, ShoppingBag, Sparkles } from 'lucide-react-native'
import * as gamificationService from '@/services/gamification'
import { useAuthStore } from '@/store'
import type { Reward } from '@/types/database'

interface RewardCardProps {
  reward: Reward
  onRewardClaimed?: () => void
}

export function RewardCard({ reward, onRewardClaimed }: RewardCardProps) {
  const { userProfile, fetchProfileAndFamily } = useAuthStore()
  const [isClaiming, setIsClaiming] = useState(false)

  const userPoints = userProfile?.points || 0
  const canAfford = gamificationService.canAffordReward(userPoints, reward.points_required)
  const pointsShort = gamificationService.pointsNeeded(userPoints, reward.points_required)

  /**
   * Handle reward claim button press
   * This is the main example of how to use claimReward()
   */
  const handleClaimReward = async () => {
    if (!reward.is_active) {
      Alert.alert('Unavailable', 'This reward is no longer available')
      return
    }

    if (!canAfford) {
      Alert.alert(
        'Not Enough Points',
        `You need ${pointsShort} more points to claim this reward!`,
        [{ text: 'OK' }]
      )
      return
    }

    // Confirm the claim
    Alert.alert(
      'Claim Reward',
      `Are you sure you want to claim "${reward.title}" for ${reward.points_required} points?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Claim',
          style: 'default',
          onPress: async () => {
            try {
              setIsClaiming(true)

              // Call the claim_reward RPC function via our service
              const newBalance = await gamificationService.claimReward(reward.id)

              // Success! Show celebration
              Alert.alert(
                '🎉 Reward Claimed!',
                `You've claimed "${reward.title}"!\n\nYour new balance: ${newBalance} points`,
                [{ text: 'Awesome!' }]
              )

              // Refresh the user's profile to get updated points
              // The RPC function has already updated the database
              await fetchProfileAndFamily()

              // Notify parent component to refresh rewards list
              onRewardClaimed?.()

            } catch (error) {
              // Handle specific error types
              if (error instanceof gamificationService.RewardClaimError) {
                switch (error.code) {
                  case 'INSUFFICIENT_POINTS':
                    Alert.alert(
                      'Not Enough Points',
                      'You don\'t have enough points for this reward. Complete more tasks to earn points!',
                      [{ text: 'OK' }]
                    )
                    break

                  case 'REWARD_INACTIVE':
                    Alert.alert(
                      'Reward Unavailable',
                      'This reward is no longer available. Please choose another one.',
                      [{ text: 'OK' }]
                    )
                    break

                  case 'REWARD_NOT_FOUND':
                    Alert.alert(
                      'Reward Not Found',
                      'This reward no longer exists.',
                      [{ text: 'OK' }]
                    )
                    break

                  default:
                    Alert.alert(
                      'Error',
                      `Failed to claim reward: ${(error as Error).message}`,
                      [{ text: 'OK' }]
                    )
                }
              } else {
                // Unknown error
                console.error('Unexpected error claiming reward:', error)
                Alert.alert(
                  'Error',
                  'An unexpected error occurred. Please try again.',
                  [{ text: 'OK' }]
                )
              }
            } finally {
              setIsClaiming(false)
            }
          },
        },
      ]
    )
  }

  return (
    <View
      className="bg-white rounded-3xl p-4 mb-3 mx-4 shadow-lg"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Reward Image */}
      {reward.image_url ? (
        <Image
          source={{ uri: reward.image_url }}
          className="w-full h-40 rounded-2xl mb-3 bg-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 rounded-2xl mb-3 bg-gradient-to-br from-purple-400 to-pink-400 items-center justify-center">
          <ShoppingBag size={48} color="#fff" strokeWidth={2} />
        </View>
      )}

      {/* Reward Info */}
      <View className="mb-3">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          {reward.title}
        </Text>
        {reward.description && (
          <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
            {reward.description}
          </Text>
        )}
      </View>

      {/* Points Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-4 py-2 flex-row items-center">
          <Award size={16} color="#fff" strokeWidth={2.5} />
          <Text className="text-white font-bold text-base ml-2">
            {reward.points_required} Points
          </Text>
        </View>

        {!reward.is_active && (
          <View className="bg-gray-100 rounded-full px-3 py-1">
            <Text className="text-gray-600 font-semibold text-xs">
              Inactive
            </Text>
          </View>
        )}
      </View>

      {/* Points Status Message */}
      {!canAfford && reward.is_active && (
        <View className="bg-amber-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Sparkles size={16} color="#d97706" strokeWidth={2} />
          <Text className="text-amber-700 text-sm font-medium ml-2 flex-1">
            You need {pointsShort} more points!
          </Text>
        </View>
      )}

      {/* Claim Button */}
      <TouchableOpacity
        onPress={handleClaimReward}
        disabled={!canAfford || !reward.is_active || isClaiming}
        className={`rounded-2xl py-3.5 px-4 flex-row items-center justify-center ${
          canAfford && reward.is_active && !isClaiming
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gray-200'
        }`}
        activeOpacity={0.8}
      >
        <ShoppingBag
          size={18}
          color={canAfford && reward.is_active ? '#fff' : '#9ca3af'}
          strokeWidth={2.5}
        />
        <Text
          className={`font-bold text-base ml-2 ${
            canAfford && reward.is_active && !isClaiming
              ? 'text-white'
              : 'text-gray-400'
          }`}
        >
          {isClaiming
            ? 'Claiming...'
            : canAfford && reward.is_active
            ? 'Claim Reward'
            : !reward.is_active
            ? 'Unavailable'
            : 'Need More Points'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

/**
 * Simple button-only example for minimal use cases
 */
export function SimpleClaimButton({
  reward,
  onSuccess,
}: {
  reward: Reward
  onSuccess?: () => void
}) {
  const [isClaiming, setIsClaiming] = useState(false)
  const { fetchProfileAndFamily } = useAuthStore()

  const handleClaim = async () => {
    try {
      setIsClaiming(true)
      
      // This is the core logic - just one function call!
      const newBalance = await gamificationService.claimReward(reward.id)
      
      // Refresh profile to get updated points
      await fetchProfileAndFamily()
      
      // Success callback
      onSuccess?.()
      
      Alert.alert('Success!', `New balance: ${newBalance} points`)
    } catch (error) {
      if (error instanceof gamificationService.RewardClaimError) {
        Alert.alert('Error', (error as Error).message)
      } else {
        Alert.alert('Error', 'Failed to claim reward')
      }
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <TouchableOpacity
      onPress={handleClaim}
      disabled={isClaiming}
      className="bg-green-500 rounded-lg py-3 px-6"
    >
      <Text className="text-white font-bold">
        {isClaiming ? 'Claiming...' : 'Claim'}
      </Text>
    </TouchableOpacity>
  )
}
