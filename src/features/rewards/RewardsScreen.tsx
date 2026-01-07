import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Gift } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { claimReward, createReward, fetchRewards } from '@/services/rewards';
import { getProfilePoints } from '@/utils/profile';
import type { Reward } from '@/types';

export function RewardsScreen() {
  const { family, profile } = useAuthStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [title, setTitle] = useState('');
  const [cost, setCost] = useState('50');
  const [isLoading, setIsLoading] = useState(false);

  const loadRewards = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchRewards(family.id);
      setRewards(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [family?.id]);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    if (!title.trim()) {
      Alert.alert('Missing info', 'Enter reward title.');
      return;
    }

    try {
      setIsLoading(true);
      const created = await createReward({
        family_id: family.id,
        title: title.trim(),
        cost: Number(cost) || 0,
        created_by: profile.id ?? profile.user_id ?? null,
      });
      setRewards((prev) => [created, ...prev]);
      setTitle('');
      setCost('50');
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (reward: Reward) => {
    if (!profile) return;
    try {
      setIsLoading(true);
      await claimReward(reward, profile);
      Alert.alert('Claim sent', 'Parent approval pending.');
    } catch (error) {
      Alert.alert('Claim failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const points = getProfilePoints(profile);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Rewards</Text>
        <Text className="text-base text-slate-600 mt-1">You have {points} points.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">New reward</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Reward title"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Points cost"
            placeholderTextColor="#94A3B8"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
          />
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-pink-500 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Add reward</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Reward shop</Text>
          <View className="mt-4 gap-3">
            {rewards.map((reward) => (
              <View key={reward.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-slate-900 font-medium">{reward.title}</Text>
                    <Text className="text-xs text-slate-500 mt-1">{reward.cost} pts</Text>
                  </View>
                  <TouchableOpacity
                    className="bg-purple-600 px-3 py-2 rounded-xl"
                    onPress={() => handleClaim(reward)}
                  >
                    <View className="flex-row items-center">
                      <Gift size={16} color="#FFFFFF" />
                      <Text className="text-white font-semibold ml-2">Claim</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {rewards.length === 0 && (
              <Text className="text-sm text-slate-500">No rewards yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
