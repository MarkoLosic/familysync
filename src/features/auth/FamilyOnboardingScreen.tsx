import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, KeyRound } from 'lucide-react-native';
import { createFamily, joinFamily } from '@/services/family';
import { useAuthStore } from '@/store';

export function FamilyOnboardingScreen() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfileAndFamily = useAuthStore((state) => state.refreshProfileAndFamily);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!profile) return;
    if (!familyName.trim()) {
      Alert.alert('Missing info', 'Enter your family name.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await createFamily(familyName.trim(), profile);
      await refreshProfileAndFamily();
      Alert.alert('Family created!', `Invite code: ${result.inviteCode}`);
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!profile) return;
    if (!inviteCode.trim()) {
      Alert.alert('Missing info', 'Enter the invite code.');
      return;
    }

    try {
      setIsLoading(true);
      await joinFamily(inviteCode, profile);
      await refreshProfileAndFamily();
    } catch (error) {
      Alert.alert('Join failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#E0F2FE', '#FCE7F3', '#EDE9FE']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-10">
          <View className="items-center mb-10">
            <View className="bg-white/90 rounded-full p-6 shadow-md">
              <Text className="text-5xl">🏡</Text>
            </View>
            <Text className="text-3xl font-bold text-slate-900 mt-6">Set up your family</Text>
            <Text className="text-base text-slate-600 mt-2 text-center">
              Create a new family or join one with an invite code.
            </Text>
          </View>

          <View className="gap-6">
            <View className="bg-white rounded-3xl p-5 shadow-md">
              <View className="flex-row items-center mb-3">
                <Users size={20} color="#7C3AED" />
                <Text className="text-lg font-semibold text-slate-900 ml-2">Create a family</Text>
              </View>
              <TextInput
                className="bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
                placeholder="Family name"
                placeholderTextColor="#94A3B8"
                value={familyName}
                onChangeText={setFamilyName}
              />
              <TouchableOpacity
                className="mt-4 rounded-2xl overflow-hidden"
                onPress={handleCreate}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#6366F1', '#8B5CF6']} className="py-3 items-center">
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Create family</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-3xl p-5 shadow-md">
              <View className="flex-row items-center mb-3">
                <KeyRound size={20} color="#EC4899" />
                <Text className="text-lg font-semibold text-slate-900 ml-2">Join with code</Text>
              </View>
              <TextInput
                className="bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
                placeholder="Enter invite code"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={setInviteCode}
              />
              <TouchableOpacity
                className="mt-4 rounded-2xl overflow-hidden"
                onPress={handleJoin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#F97316', '#EC4899']} className="py-3 items-center">
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Join family</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
