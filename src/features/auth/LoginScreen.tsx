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
import { Mail, Lock } from 'lucide-react-native';
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

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const refreshProfileAndFamily = useAuthStore((state) => state.refreshProfileAndFamily);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 0;
  const theme = darkTheme.colors;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      if (!data.session) {
        Alert.alert('Sign in failed', 'Account not confirmed yet.');
        return;
      }
      setSession(data.session);
      await refreshProfileAndFamily();
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again.');
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
          <View style={{ position: 'absolute', top: 60, left: -30, width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primary, opacity: 0.6 }} />
          <View style={{ position: 'absolute', top: 120, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primaryLight, opacity: 0.6 }} />
          <View style={{ position: 'absolute', bottom: 200, right: -20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.green, opacity: 0.5 }} />

          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
            {/* Avatari */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, height: 100 }}>
                <View style={{ position: 'absolute', left: 80, top: 0 }}>
                  <Avatar emoji="👧" size={50} color={theme.primary} />
                </View>
                <Avatar emoji="👨" size={80} color={theme.primary} />
                <View style={{ position: 'absolute', right: 80, top: 0 }}>
                  <Avatar emoji="👩" size={50} color={theme.primary} />
                </View>
              </View>
              
              <View style={{ backgroundColor: theme.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 8 }}>
                <Text style={{ color: theme.background, fontWeight: '700', fontSize: 14 }}>Spona</Text>
              </View>
              
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: theme.text, marginTop: 24, textAlign: 'center', lineHeight: 40 }}>
                Let's get you{'\n'}signed in!
              </Text>
            </View>

            {/* Forma */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 16, marginLeft: 4 }}>
                You don't have an account yet?{' '}
                <Text 
                  style={{ color: theme.text, fontWeight: '600' }}
                  onPress={() => navigation.navigate('Register')}
                >
                  Sign Up
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
                marginBottom: 12,
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

              <TouchableOpacity style={{ alignSelf: 'flex-start', marginBottom: 24, marginLeft: 4 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={{ color: theme.background, fontWeight: '700', fontSize: 16 }}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
