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
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const refreshProfileAndFamily = useAuthStore((state) => state.refreshProfileAndFamily);
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <LinearGradient colors={['#FDF2F8', '#EDE9FE', '#E0F2FE']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-10">
            <View className="items-center mb-10">
              <View className="bg-white/90 rounded-full p-6 shadow-md">
                <Text className="text-5xl">👨‍👩‍👧‍👦</Text>
              </View>
              <Text className="text-3xl font-bold text-slate-900 mt-6">Welcome back</Text>
              <Text className="text-base text-slate-600 mt-2 text-center">
                Sign in to keep the family in sync.
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2">Email</Text>
                <View className="flex-row items-center bg-white rounded-3xl px-4 py-4 shadow-sm">
                  <Mail size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="your@email.com"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2">Password</Text>
                <View className="flex-row items-center bg-white rounded-3xl px-4 py-4 shadow-sm">
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <TouchableOpacity
                className="mt-6 rounded-3xl overflow-hidden shadow-lg"
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center py-4"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <LogIn size={20} color="#FFFFFF" />
                      <Text className="text-white font-semibold text-base ml-2">Sign in</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Text className="text-slate-600">New here? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text className="text-indigo-600 font-semibold">Create account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
