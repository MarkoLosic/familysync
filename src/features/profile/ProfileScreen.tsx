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
import { useTheme } from '@/theme';
import { AppLanguage, languageOptions, useI18n } from '@/i18n';

export function ProfileScreen() {
  const { profile, family, familyMembers, signOut } = useAuthStore();
  const { theme, themeName, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useI18n();
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
    Alert.alert(t('profile.copiedTitle'), t('profile.copiedMessage'));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    if (!username.trim()) {
      Alert.alert(t('profile.missingInfoTitle'), t('profile.enterUsername'));
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim(), name: username.trim() })
        .eq('id', profile.id ?? profile.user_id);
      if (error) throw error;
      Alert.alert(t('profile.updatedTitle'), t('profile.profileUpdated'));
    } catch (error) {
      Alert.alert(t('profile.updateFailed'), error instanceof Error ? error.message : t('profile.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password.trim()) {
      Alert.alert(t('profile.missingInfoTitle'), t('profile.enterPassword'));
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.trim() });
      if (error) throw error;
      setPassword('');
      Alert.alert(t('profile.updatedTitle'), t('profile.passwordUpdated'));
    } catch (error) {
      Alert.alert(t('profile.updateFailed'), error instanceof Error ? error.message : t('profile.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (next: AppLanguage) => {
    setLanguage(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Dekorativni krugovi */}
        <View style={{ position: 'absolute', top: 50, right: 30, width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.greenLight, opacity: 0.4 }} />
        <View style={{ position: 'absolute', top: 120, left: -15, width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.pinkLight, opacity: 0.4 }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '700' }}>{t('profile.title')} 👤</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16, marginTop: 8 }}>{t('profile.subtitle')}</Text>
        </View>

        {/* User Info Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center'
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700' }}>{profile?.name ?? t('profile.userFallback')}</Text>
            <View style={{ 
              backgroundColor: theme.colors.primary, 
              borderRadius: 12, 
              paddingHorizontal: 12, 
              paddingVertical: 4,
              marginTop: 8
            }}>
              <Text style={{ color: theme.colors.card, fontSize: 12, fontWeight: '600' }}>{profile?.role ?? t('profile.memberFallback')}</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: '800', marginTop: 16 }}>{getProfilePoints(profile)}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{t('profile.totalPoints')}</Text>
          </View>
        </View>

        {/* Family Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>{t('profile.family')}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16, marginTop: 8 }}>{family?.name ?? t('profile.noFamily')}</Text>
            
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 16 }}>{t('profile.inviteCode')}</Text>
            <View style={{ 
              backgroundColor: theme.colors.inputBg, 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>
                {isLoading ? t('profile.loading') : inviteCode ?? t('profile.notAvailable')}
              </Text>
              <TouchableOpacity onPress={handleCopy} disabled={!inviteCode}>
                <Copy size={20} color={inviteCode ? theme.colors.primary : theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>{t('profile.settings')}</Text>
            
            <View style={{ 
              backgroundColor: theme.colors.inputBg, 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <TextInput
                style={{ fontSize: 16, color: theme.colors.text }}
                placeholder={t('profile.usernamePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 12,
              }}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={{ color: theme.colors.card, fontWeight: '600', fontSize: 16 }}>{t('profile.updateUsername')}</Text>
              )}
            </TouchableOpacity>

            <View style={{ 
              backgroundColor: theme.colors.inputBg, 
              borderRadius: 16, 
              paddingHorizontal: 16, 
              paddingVertical: 14,
              marginTop: 16,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <TextInput
                style={{ fontSize: 16, color: theme.colors.text }}
                placeholder={t('profile.newPasswordPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.cardSecondary,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 12,
              }}
              onPress={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{t('profile.changePassword')}</Text>
              )}
            </TouchableOpacity>

            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 20 }}>{t('profile.language')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
              {languageOptions.map((option) => {
                const isActive = language === option.code;
                return (
                  <TouchableOpacity
                    key={option.code}
                    style={{
                      backgroundColor: isActive ? theme.colors.primary : theme.colors.inputBg,
                      borderRadius: 14,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    }}
                    onPress={() => handleLanguageChange(option.code)}
                  >
                    <Text style={{ color: isActive ? theme.colors.card : theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Members Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>{t('profile.members')}</Text>
            <View style={{ marginTop: 16, gap: 12 }}>
              {familyMembers.map((member, index) => {
                const colors = [theme.colors.greenLight, theme.colors.pinkLight, theme.colors.orangeLight, theme.colors.primaryLight];
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
                      backgroundColor: theme.colors.card,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ fontSize: 20 }}>👤</Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{member.name}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>{member.role}</Text>
                    </View>
                  </View>
                );
              })}
              {familyMembers.length === 0 && (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{t('profile.noMembers')}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Theme Switcher */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            onPress={toggleTheme}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>
              {t('profile.theme')}: {themeName === 'light' ? t('profile.themeLight') : themeName === 'dark' ? t('profile.themeDark') : t('profile.themeColorful')} 🌈
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.error,
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleSignOut}
          >
            <LogOut size={20} color={theme.colors.card} />
            <Text style={{ color: theme.colors.card, fontWeight: '600', fontSize: 16, marginLeft: 8 }}>{t('profile.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
