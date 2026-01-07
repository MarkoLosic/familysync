import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coins } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import * as gamificationService from '@/services/gamification';
import type { Reward } from '@/types/database';
import { RewardCard } from './RewardCard';

export function RewardsScreen() {
  const { userProfile, fetchProfileAndFamily } = useAuthStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);

  // Fetch rewards on mount
  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      // Get family_id from userProfile
      if (!userProfile?.family_id) {
        setRewards([]);
        return;
      }
      const activeRewards = await gamificationService.getActiveRewards(userProfile.family_id);
      setRewards(activeRewards);
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadRewards(), fetchProfileAndFamily()]);
    setIsRefreshing(false);
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!userProfile) {
      Alert.alert('Error', 'User profile not found');
      return;
    }

    // Find the reward
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) {
      Alert.alert('Error', 'Reward not found');
      return;
    }

    // Check if user can afford the reward
    if (!gamificationService.canAffordReward(userProfile.points, reward.points_required)) {
      const needed = gamificationService.pointsNeeded(userProfile.points, reward.points_required);
      Alert.alert(
        'Not Enough Points',
        `You need ${needed} more point${needed === 1 ? '' : 's'} to claim this reward.`
      );
      return;
    }

    // Confirm purchase
    Alert.alert(
      'Claim Reward',
      `Do you want to claim "${reward.title}" for ${reward.points_required} points?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              setClaimingRewardId(reward.id);
              
              // claimReward only needs rewardId - it gets user from auth
              await gamificationService.claimReward(reward.id);

              // Refresh profile to get updated points
              await fetchProfileAndFamily();

              Alert.alert(
                'Success! 🎉',
                `You've claimed "${reward.title}"! Your parent will be notified.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error claiming reward:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to claim reward';
              Alert.alert('Error', errorMessage);
            } finally {
              setClaimingRewardId(null);
            }
          },
        },
      ]
    );
  };

  // User points (default to 0 if not available)
  const userPoints = userProfile?.points || 0;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header with Points */}
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Rewards Shop
          </Text>
          
          <View className="flex-row items-center bg-blue-50 rounded-2xl p-4">
            <View className="bg-blue-100 rounded-full p-3 mr-4">
              <Coins size={32} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-gray-600 text-sm mb-1">Your Points</Text>
              <Text className="text-4xl font-bold text-blue-600">
                {userPoints}
              </Text>
            </View>
          </View>
        </View>

        {/* Rewards Grid */}
        <View className="px-4 pt-6">
          {rewards.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-gray-500 text-lg text-center">
                No rewards available yet.
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Check back later for awesome rewards!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {rewards.map((reward) => (
                <View key={reward.id} className="w-[48%] mb-4">
                  <RewardCard
                    reward={reward}
                    userPoints={userPoints}
                    onClaim={handleClaimReward}
                    disabled={claimingRewardId === reward.id}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
