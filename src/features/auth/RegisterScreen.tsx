import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import { darkTheme } from '@/theme';

// Avatar komponenta za 3D stil
const Avatar = ({ emoji, size = 60, color = darkTheme.colors.primary }: { emoji: string; size?: number; color?: string }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
  </View>
);

const createProfile = async (userId: string, name: string, email: string) => {
  const payload = {
    id: userId,
    user_id: userId,
    name,
    email,
    role: 'member',
    points: 0,
    level: 1,
  };

  const { error } = await supabase.from('profiles').insert(payload);
  if (!error) return;
  if (error.code === '23505' || String(error.message).toLowerCase().includes('duplicate')) {
    return;
  }

  if (String(error.message).includes('column')) {
    const { error: fallbackError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name,
        email,
        role: 'member',
        points: 0,
        level: 1,
      });
    if (
      fallbackError &&
      (fallbackError.code === '23505' ||
        String(fallbackError.message).toLowerCase().includes('duplicate'))
    ) {
      return;
    }
    if (fallbackError) throw fallbackError;
    return;
  }

  throw error;
};

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const refreshProfileAndFamily = useAuthStore((state) => state.refreshProfileAndFamily);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 0;
  const theme = darkTheme.colors;
  const emailRedirectTo =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : undefined;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing info', 'Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name },
          emailRedirectTo,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Account created, but user is missing.');

      await createProfile(data.user.id, name.trim(), email.trim().toLowerCase());

      if (!data.session) {
        Alert.alert('Check your email', 'Confirm your email to finish registration.');
        return;
      }

      await refreshProfileAndFamily();
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomInset }}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
        >
          {/* Dekorativni krugovi */}
          <View style={{ position: 'absolute', top: 80, right: -20, width: 70, height: 70, borderRadius: 35, backgroundColor: theme.primary, opacity: 0.5 }} />
          <View style={{ position: 'absolute', top: 150, left: 20, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.primaryLight, opacity: 0.5 }} />
          <View style={{ position: 'absolute', bottom: 150, right: 40, width: 50, height: 50, borderRadius: 25, backgroundColor: theme.green, opacity: 0.4 }} />

          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
            {/* Avatari */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, height: 100 }}>
                <View style={{ position: 'absolute', left: 80, top: 10 }}>
                  <Avatar emoji="✨" size={45} color={theme.primaryLight} />
                </View>
                <Avatar emoji="👋" size={80} color={theme.primary} />
                <View style={{ position: 'absolute', right: 80, top: 10 }}>
                  <Avatar emoji="🎉" size={45} color={theme.green} />
                </View>
              </View>
              
              <View style={{ backgroundColor: theme.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 8 }}>
                <Text style={{ color: theme.background, fontWeight: '700', fontSize: 14 }}>Spona</Text>
              </View>
              
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.text, marginTop: 24, textAlign: 'center', lineHeight: 40 }}>
                Join your{'\n'}family today!
              </Text>
            </View>

            {/* Forma */}
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 16, marginLeft: 4 }}>
                Already have an account?{' '}
                <Text 
                  style={{ color: theme.text, fontWeight: '600' }}
                  onPress={() => navigation.navigate('Login')}
                >
                  Sign In
                </Text>
              </Text>

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: theme.inputBg, 
                borderRadius: 16, 
                paddingHorizontal: 16, 
                paddingVertical: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border
              }}>
                <User size={20} color={theme.textSecondary} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: theme.text }}
                  placeholder="Your name"
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: theme.inputBg, 
                borderRadius: 16, 
                paddingHorizontal: 16, 
                paddingVertical: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border
              }}>
                <Mail size={20} color={theme.textSecondary} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: theme.text }}
                  placeholder="Email"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: theme.inputBg, 
                borderRadius: 16, 
                paddingHorizontal: 16, 
                paddingVertical: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.border
              }}>
                <Lock size={20} color={theme.textSecondary} />
                <TextInput
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, color: theme.text }}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={{ color: theme.background, fontWeight: '700', fontSize: 16 }}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
