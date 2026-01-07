import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Copy, LogOut } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '@/store';
import { supabase } from '@/services/supabase';
import { getProfilePoints } from '@/utils/profile';

export function ProfileScreen() {
  const { profile, family, familyMembers, signOut } = useAuthStore();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCode = async () => {
      if (!family?.id) return;
      setIsLoading(true);
      try {
        if (family.invite_code) {
          setInviteCode(family.invite_code);
          return;
        }
        const { data } = await supabase
          .from('family_invites')
          .select('code')
          .eq('family_id', family.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setInviteCode(data?.code ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCode();
  }, [family?.id]);

  const handleCopy = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied', 'Invite code copied to clipboard.');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Profile</Text>
        <Text className="text-base text-slate-600 mt-1">Manage your family details.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Your info</Text>
          <View className="mt-3 gap-2">
            <Text className="text-slate-700">Name: {profile?.name ?? '-'}</Text>
            <Text className="text-slate-700">Role: {profile?.role ?? '-'}</Text>
            <Text className="text-slate-700">Points: {getProfilePoints(profile)}</Text>
          </View>
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Family</Text>
          <Text className="text-slate-700 mt-2">{family?.name ?? 'No family yet'}</Text>
          <View className="mt-4">
            <Text className="text-sm text-slate-500">Invite code</Text>
            <View className="flex-row items-center justify-between mt-2 bg-slate-50 rounded-2xl px-4 py-3">
              <Text className="text-slate-900 font-semibold">
                {isLoading ? 'Loading...' : inviteCode ?? 'Not available'}
              </Text>
              <TouchableOpacity onPress={handleCopy} disabled={!inviteCode}>
                <Copy size={18} color={inviteCode ? '#7C3AED' : '#CBD5F5'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 mt-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Members</Text>
          <View className="mt-4 gap-2">
            {familyMembers.map((member) => (
              <View key={member.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                <Text className="text-slate-900 font-medium">{member.name}</Text>
                <Text className="text-xs text-slate-500 mt-1">{member.role}</Text>
              </View>
            ))}
            {familyMembers.length === 0 && (
              <Text className="text-sm text-slate-500">No members yet.</Text>
            )}
          </View>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <TouchableOpacity
          className="rounded-2xl bg-slate-900 py-4 items-center"
          onPress={handleSignOut}
        >
          <View className="flex-row items-center">
            <LogOut size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Sign out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
