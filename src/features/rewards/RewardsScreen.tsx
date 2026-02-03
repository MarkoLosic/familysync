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
import { useTheme } from '@/theme';

// Reward card colors
const REWARD_COLORS = [
  { bg: '#F472B620', accent: '#F472B6' },
  { bg: '#A78BFA20', accent: '#A78BFA' },
  { bg: '#60A5FA20', accent: '#60A5FA' },
  { bg: '#34D39920', accent: '#34D399' },
  { bg: '#FBBF2420', accent: '#FBBF24' },
];

// Pastel accent circles decoration
const AccentCircles = ({ theme }: { theme: any }) => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: theme.primary,
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
        backgroundColor: theme.primary,
        opacity: 0.1,
      }}
    />
  </>
);

export function RewardsScreen() {
  const { family, profile } = useAuthStore();
  const { theme } = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccentCircles theme={theme.colors} />
      
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
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Gift size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>Rewards</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                  Earn and redeem 🎁
                </Text>
              </View>
            </View>
          </View>
          
          {/* Points Badge */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: theme.colors.card,
              borderRadius: 20,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Star size={28} color={theme.colors.primary} fill={theme.colors.primary} />
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 12 }}>
              {points}
            </Text>
            <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginLeft: 8 }}>points</Text>
          </View>
        </View>

        {/* Create Reward Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Sparkles size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                New Reward
              </Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="Reward title (e.g., Ice cream trip)"
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            
            <View
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Star size={18} color={theme.colors.primary} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.text,
                  marginLeft: 10,
                }}
                placeholder="Points cost"
                placeholderTextColor={theme.colors.textMuted}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
              <Text style={{ color: theme.colors.textMuted }}>pts</Text>
            </View>
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                alignItems: 'center',
                ...theme.shadows.card,
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
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <ShoppingBag size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                Reward Shop
              </Text>
            </View>
            
            {rewards.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🎁</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>No rewards yet. Add your first one!</Text>
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
                          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                            {reward.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 }}>
                              {reward.cost} pts
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={{
                            backgroundColor: canAfford ? colorScheme.accent : theme.colors.border,
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
