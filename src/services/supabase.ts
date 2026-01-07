import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  Constants?.expoConfig?.extra?.supabaseUrl ||
  '';
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  Constants?.expoConfig?.extra?.supabaseAnonKey ||
  '';

if (!url || !anonKey) {
  console.warn(
    'Supabase env vars missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
