/**
 * Reward Card Component
 * Displays a single reward in the rewards grid
 */

import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { ShoppingBag, Lock } from 'lucide-react-native'
import { COLORS } from '../../types/app'
import type { Tables } from '../../types'

interface RewardCardProps {
  reward: Tables<'rewards'>
  userPoints: number
  onClaim: (rewardId: string) => void
  disabled?: boolean
}

// Default icons for rewards (can be replaced with images)
const REWARD_ICONS = {
  cinema: '🎬',
  gaming: '🎮',
  icecream: '🍦',
  toy: '🧸',
  book: '📚',
  music: '🎵',
  sport: '⚽',
  art: '🎨',
  default: '🎁',
}

// Determine icon based on reward title
function getRewardIcon(title?: string | null): string {
  const lowerTitle = (title || '').toLowerCase()
  if (!lowerTitle) return REWARD_ICONS.default
  
  if (lowerTitle.includes('cinema') || lowerTitle.includes('movie')) return REWARD_ICONS.cinema
  if (lowerTitle.includes('game') || lowerTitle.includes('xbox') || lowerTitle.includes('playstation')) return REWARD_ICONS.gaming
  if (lowerTitle.includes('ice cream') || lowerTitle.includes('icecream')) return REWARD_ICONS.icecream
  if (lowerTitle.includes('toy')) return REWARD_ICONS.toy
  if (lowerTitle.includes('book')) return REWARD_ICONS.book
  if (lowerTitle.includes('music')) return REWARD_ICONS.music
  if (lowerTitle.includes('sport') || lowerTitle.includes('soccer') || lowerTitle.includes('football')) return REWARD_ICONS.sport
  if (lowerTitle.includes('art') || lowerTitle.includes('paint') || lowerTitle.includes('draw')) return REWARD_ICONS.art
  
  return REWARD_ICONS.default
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userPoints,
  onClaim,
  disabled = false,
}) => {
  const canAfford = userPoints >= reward.points_required
  const pointsNeeded = reward.points_required - userPoints
  const isDisabled = disabled || !canAfford || !reward.is_active

  return (
    <View
      className="bg-white rounded-3xl p-4 m-2"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        opacity: isDisabled ? 0.6 : 1,
      }}
    >
      {/* Reward Icon/Image */}
      <View className="items-center mb-3">
        {reward.image_url ? (
          <Image
            source={{ uri: reward.image_url }}
            className="w-20 h-20 rounded-2xl"
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-20 h-20 rounded-2xl items-center justify-center"
            style={{ backgroundColor: COLORS.surface.secondary }}
          >
            <Text className="text-5xl">{getRewardIcon(reward.title)}</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        className="text-center text-base font-bold mb-1"
        style={{ color: COLORS.text.primary }}
        numberOfLines={2}
      >
        {reward.title}
      </Text>

      {/* Description */}
      {reward.description && (
        <Text
          className="text-center text-xs mb-2"
          style={{ color: COLORS.text.secondary }}
          numberOfLines={2}
        >
          {reward.description}
        </Text>
      )}

      {/* Price */}
      <View className="flex-row items-center justify-center mb-3">
        <Text className="text-2xl mr-1">🪙</Text>
        <Text
          className="text-lg font-bold"
          style={{ color: canAfford ? COLORS.primary : COLORS.text.tertiary }}
        >
          {reward.points_required} XP
        </Text>
      </View>

      {/* Points Needed Badge */}
      {!canAfford && pointsNeeded > 0 && (
        <View
          className="px-3 py-1 rounded-full mb-2 self-center"
          style={{ backgroundColor: COLORS.warning + '20' }}
        >
          <Text className="text-xs font-semibold" style={{ color: COLORS.warning }}>
            Need {pointsNeeded} more XP
          </Text>
        </View>
      )}

      {/* Buy Button */}
      <TouchableOpacity
        onPress={() => onClaim(reward.id)}
        disabled={isDisabled}
        className="py-3 px-4 rounded-2xl flex-row items-center justify-center"
        style={{
          backgroundColor: isDisabled
            ? COLORS.surface.tertiary
            : canAfford
            ? COLORS.primary
            : COLORS.surface.tertiary,
        }}
      >
        {isDisabled && !canAfford ? (
          <>
            <Lock size={16} color={COLORS.text.tertiary} />
            <Text className="ml-2 font-semibold" style={{ color: COLORS.text.tertiary }}>
              Locked
            </Text>
          </>
        ) : (
          <>
            <ShoppingBag size={16} color="#FFFFFF" />
            <Text className="ml-2 font-semibold text-white">
              Buy
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Inactive Badge */}
      {!reward.is_active && (
        <View
          className="absolute top-2 right-2 px-2 py-1 rounded-full"
          style={{ backgroundColor: COLORS.error + '20' }}
        >
          <Text className="text-xs font-semibold" style={{ color: COLORS.error }}>
            Unavailable
          </Text>
        </View>
      )}
    </View>
  )
}
