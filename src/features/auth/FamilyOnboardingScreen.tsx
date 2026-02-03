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
import { Users, KeyRound, Home, Sparkles } from 'lucide-react-native';
import { createFamily, joinFamily } from '@/services/family';
import { useAuthStore } from '@/store';
import { darkTheme } from '@/theme';

// Pastel accent circles decoration
const AccentCircles = () => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -80,
        right: -80,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: darkTheme.colors.primary,
        opacity: 0.15,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 200,
        left: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: darkTheme.colors.pink,
        opacity: 0.1,
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 100,
        right: -60,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: darkTheme.colors.info,
        opacity: 0.1,
      }}
    />
  </>
);

export function FamilyOnboardingScreen() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfileAndFamily = useAuthStore((state) => state.refreshProfileAndFamily);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = darkTheme.colors;

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
      Alert.alert('🎉 Family created!', `Invite code: ${result.inviteCode}\n\nShare this code with your family members!`);
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AccentCircles />
      
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: theme.card,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 3,
                borderColor: `${theme.primary}40`,
              }}
            >
              <Text style={{ fontSize: 50 }}>🏡</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, marginTop: 20, textAlign: 'center' }}>
              Set up your family
            </Text>
            <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
              Create a new family or join one{'\n'}with an invite code
            </Text>
          </View>

          {/* Create Family Card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: theme.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Users size={22} color={theme.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Create a Family</Text>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>Start your family hub</Text>
              </View>
            </View>
            
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 16,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              placeholder="Family name (e.g., The Smiths)"
              placeholderTextColor={theme.textMuted}
              value={familyName}
              onChangeText={setFamilyName}
            />
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.primary,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleCreate}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Sparkles size={18} color={theme.text} />
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                    Create Family
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
            <Text style={{ color: theme.textMuted, marginHorizontal: 16, fontSize: 14 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
          </View>

          {/* Join Family Card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              marginTop: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: theme.pinkLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <KeyRound size={22} color={theme.pink} />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Join with Code</Text>
                <Text style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>Enter family invite code</Text>
              </View>
            </View>
            
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 16,
                color: theme.text,
                borderWidth: 1,
                borderColor: theme.border,
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
              placeholder="Enter invite code"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.pink,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: theme.pink,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleJoin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Home size={18} color={theme.text} />
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                    Join Family
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
