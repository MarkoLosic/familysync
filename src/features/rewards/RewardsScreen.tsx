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
import { Gift, Star, Sparkles, ShoppingBag } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { claimReward, createReward, fetchRewards } from '@/services/rewards';
import { getProfilePoints } from '@/utils/profile';
import { hapticError, hapticSuccess } from '@/utils/haptics';
import type { Reward } from '@/types';

// Reward card colors
const REWARD_COLORS = [
  { bg: '#F472B620', accent: '#F472B6' },
  { bg: '#A78BFA20', accent: '#A78BFA' },
  { bg: '#60A5FA20', accent: '#60A5FA' },
  { bg: '#34D39920', accent: '#34D399' },
  { bg: '#FBBF2420', accent: '#FBBF24' },
];

// Pastel accent circles decoration
const AccentCircles = () => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#EC4899',
        opacity: 0.15,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 100,
        left: -70,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#8B5CF6',
        opacity: 0.1,
      }}
    />
  </>
);

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
      void hapticSuccess();
    } catch (error) {
      void hapticError();
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
      void hapticSuccess();
      Alert.alert('🎉 Claim sent!', 'Parent approval pending.');
    } catch (error) {
      void hapticError();
      Alert.alert('Claim failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const points = getProfilePoints(profile);

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <AccentCircles />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#EC4899',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Gift size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>Rewards</Text>
                <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                  Earn and redeem 🎁
                </Text>
              </View>
            </View>
          </View>
          
          {/* Points Badge */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: '#23262F',
              borderRadius: 20,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FBBF24',
              shadowColor: '#FBBF24',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Star size={28} color="#FBBF24" fill="#FBBF24" />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FBBF24', marginLeft: 12 }}>
              {points}
            </Text>
            <Text style={{ fontSize: 16, color: '#A1A1AA', marginLeft: 8 }}>points</Text>
          </View>
        </View>

        {/* Create Reward Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Sparkles size={20} color="#EC4899" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                New Reward
              </Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
              }}
              placeholder="Reward title (e.g., Ice cream trip)"
              placeholderTextColor="#71717A"
              value={title}
              onChangeText={setTitle}
            />
            
            <View
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: '#3F3F46',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Star size={18} color="#FBBF24" />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#FFFFFF',
                  marginLeft: 10,
                }}
                placeholder="Points cost"
                placeholderTextColor="#71717A"
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
              <Text style={{ color: '#71717A' }}>pts</Text>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#EC4899',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#EC4899',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Add Reward</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards Shop */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <ShoppingBag size={20} color="#A78BFA" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Reward Shop
              </Text>
            </View>
            
            {rewards.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🎁</Text>
                <Text style={{ fontSize: 14, color: '#71717A' }}>No rewards yet. Add your first one!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {rewards.map((reward, index) => {
                  const colorScheme = REWARD_COLORS[index % REWARD_COLORS.length];
                  const canAfford = points >= reward.cost;
                  return (
                    <View
                      key={reward.id}
                      style={{
                        backgroundColor: colorScheme.bg,
                        borderRadius: 20,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: colorScheme.accent,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                            {reward.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Star size={14} color="#FBBF24" fill="#FBBF24" />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FBBF24', marginLeft: 4 }}>
                              {reward.cost} pts
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={{
                            backgroundColor: canAfford ? colorScheme.accent : '#3F3F46',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: canAfford ? 1 : 0.5,
                          }}
                          onPress={() => handleClaim(reward)}
                          disabled={!canAfford || isLoading}
                        >
                          <Gift size={16} color="#FFFFFF" />
                          <Text style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: 6 }}>
                            Claim
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
