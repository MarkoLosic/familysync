import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
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
  const [username, setUsername] = useState(profile?.username ?? profile?.name ?? '');
  useEffect(() => {
    setUsername(profile?.username ?? profile?.name ?? '');
  }, [profile?.username, profile?.name]);
  const [password, setPassword] = useState('');

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

  const handleUpdateProfile = async () => {
    if (!profile) return;
    if (!username.trim()) {
      Alert.alert('Missing info', 'Enter a username.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim(), name: username.trim() })
        .eq('id', profile.id ?? profile.user_id);
      if (error) throw error;
      Alert.alert('Updated', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password.trim()) {
      Alert.alert('Missing info', 'Enter a new password.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.trim() });
      if (error) throw error;
      setPassword('');
      Alert.alert('Updated', 'Password changed successfully.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Dekorativni krugovi */}
        <View style={{ position: 'absolute', top: 50, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: '#C4F5A9', opacity: 0.4 }} />
        <View style={{ position: 'absolute', top: 120, left: -15, width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5C4DE', opacity: 0.4 }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700' }}>Profile 👤</Text>
          <Text style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage your family details.</Text>
        </View>

        {/* User Info Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: '#1A1A1A', 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: '#2A2A2A',
            alignItems: 'center'
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#7C3AED',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>{profile?.name ?? 'User'}</Text>
            <View style={{ 
              backgroundColor: '#7C3AED', 
              borderRadius: 12, 
              paddingHorizontal: 12, 
              paddingVertical: 4,
              marginTop: 8
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{profile?.role ?? 'Member'}</Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 16 }}>{getProfilePoints(profile)}</Text>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Total Points</Text>
          </View>
        </View>

        {/* Family Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: '#1A1A1A', 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: '#2A2A2A'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Family</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 8 }}>{family?.name ?? 'No family yet'}</Text>
            
            <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 16 }}>Invite code</Text>
            <View style={{ 
              backgroundColor: '#0F0F0F', 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>
                {isLoading ? 'Loading...' : inviteCode ?? 'Not available'}
              </Text>
              <TouchableOpacity onPress={handleCopy} disabled={!inviteCode}>
                <Copy size={20} color={inviteCode ? '#7C3AED' : '#4B5563'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: '#1A1A1A', 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: '#2A2A2A'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Settings</Text>
            
            <View style={{ 
              backgroundColor: '#0F0F0F', 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}>
              <TextInput
                style={{ fontSize: 16, color: '#FFFFFF' }}
                placeholder="Username"
                placeholderTextColor="#6B7280"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#7C3AED',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 12,
              }}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Update username</Text>
              )}
            </TouchableOpacity>

            <View style={{ 
              backgroundColor: '#0F0F0F', 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#2A2A2A'
            }}>
              <TextInput
                style={{ fontSize: 16, color: '#FFFFFF' }}
                placeholder="New password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#374151',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 12,
              }}
              onPress={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Change password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: '#1A1A1A', 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: '#2A2A2A'
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Members</Text>
            <View style={{ marginTop: 16, gap: 12 }}>
              {familyMembers.map((member, index) => {
                const colors = ['#BBF7D0', '#FBCFE8', '#FEF08A', '#DBEAFE'];
                const bgColor = colors[index % colors.length];
                return (
                  <View 
                    key={member.id} 
                    style={{
                      backgroundColor: bgColor,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ fontSize: 20 }}>👤</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16 }}>{member.name}</Text>
                      <Text style={{ color: '#4B5563', fontSize: 12, marginTop: 2 }}>{member.role}</Text>
                    </View>
                  </View>
                );
              })}
              {familyMembers.length === 0 && (
                <Text style={{ color: '#6B7280', fontSize: 14 }}>No members yet.</Text>
              )}
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#DC2626',
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
