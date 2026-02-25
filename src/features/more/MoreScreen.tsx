import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, User, Settings, Bell, HelpCircle, Info, Menu } from 'lucide-react-native';
import type { MainStackParamList } from '@/navigation/MainNavigator';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

const menuItems: { label: string; route: keyof MainStackParamList; icon: any; color: string; emoji: string }[] = [
  { label: 'Profile', route: 'Profile', icon: User, color: '#A78BFA', emoji: '👤' },
];

// Pastel accent circles decoration
const AccentCircles = ({ theme }: { theme: any }) => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: theme.colors.primaryLight,
        opacity: 0.12,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 120,
        left: -60,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.greenLight,
        opacity: 0.1,
      }}
    />
  </>
);

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccentCircles theme={theme} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Menu size={24} color={theme.colors.card} />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>{t('more.title')}</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                {t('more.subtitle')} ⚙️
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items Card */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 16 }}>
              {t('more.quickAccess')}
            </Text>
            
            <View style={{ gap: 12 }}>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={{
                      backgroundColor: theme.colors.cardSecondary,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: theme.colors.primaryLight,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '500', color: theme.colors.text }}>
                        {item.route === 'Profile' ? t('more.profile') : item.label}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* App Info Card */}
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              marginTop: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏡</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>Spona</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 }}>{t('more.appTagline')}</Text>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 8 }}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
