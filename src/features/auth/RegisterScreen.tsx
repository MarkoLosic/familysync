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
import { Mail, Lock, UserPlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';

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
    <LinearGradient colors={['#EEF2FF', '#FCE7F3', '#E0F2FE']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 py-10">
            <View className="items-center mb-10">
              <View className="bg-white/90 rounded-full p-6 shadow-md">
                <Text className="text-5xl">✨</Text>
              </View>
              <Text className="text-3xl font-bold text-slate-900 mt-6">Create account</Text>
              <Text className="text-base text-slate-600 mt-2 text-center">
                Start your family mission with FamilySync.
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2">Name</Text>
                <View className="flex-row items-center bg-white rounded-3xl px-4 py-4 shadow-sm">
                  <UserPlus size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="Your name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                  />
                </View>
              </View>

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
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#F97316', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center py-4"
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <UserPlus size={20} color="#FFFFFF" />
                      <Text className="text-white font-semibold text-base ml-2">Create account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-4">
                <Text className="text-slate-600">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-indigo-600 font-semibold">Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
