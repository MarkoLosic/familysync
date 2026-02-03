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
        backgroundColor: '#A78BFA',
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
        backgroundColor: '#F472B6',
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
        backgroundColor: '#60A5FA',
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
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
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
                backgroundColor: '#23262F',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#A78BFA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 3,
                borderColor: '#A78BFA40',
              }}
            >
              <Text style={{ fontSize: 50 }}>🏡</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 20, textAlign: 'center' }}>
              Set up your family
            </Text>
            <Text style={{ fontSize: 15, color: '#A1A1AA', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
              Create a new family or join one{'\n'}with an invite code
            </Text>
          </View>

          {/* Create Family Card */}
          <View
            style={{
              backgroundColor: '#23262F',
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
                  backgroundColor: '#A78BFA20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Users size={22} color="#A78BFA" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>Create a Family</Text>
                <Text style={{ fontSize: 13, color: '#71717A', marginTop: 2 }}>Start your family hub</Text>
              </View>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
              }}
              placeholder="Family name (e.g., The Smiths)"
              placeholderTextColor="#71717A"
              value={familyName}
              onChangeText={setFamilyName}
            />
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#A78BFA',
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#A78BFA',
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
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                    Create Family
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#3F3F46' }} />
            <Text style={{ color: '#71717A', marginHorizontal: 16, fontSize: 14 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#3F3F46' }} />
          </View>

          {/* Join Family Card */}
          <View
            style={{
              backgroundColor: '#23262F',
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
                  backgroundColor: '#F472B620',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <KeyRound size={22} color="#F472B6" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>Join with Code</Text>
                <Text style={{ fontSize: 13, color: '#71717A', marginTop: 2 }}>Enter family invite code</Text>
              </View>
            </View>
            
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
              placeholder="Enter invite code"
              placeholderTextColor="#71717A"
              autoCapitalize="characters"
              value={inviteCode}
              onChangeText={setInviteCode}
            />
            
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#F472B6',
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#F472B6',
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
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Home size={18} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
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
