import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, User, Settings, Bell, HelpCircle, Info, Menu } from 'lucide-react-native';
import type { MainStackParamList } from '@/navigation/MainNavigator';

const menuItems: { label: string; route: keyof MainStackParamList; icon: any; color: string; emoji: string }[] = [
  { label: 'Profile', route: 'Profile', icon: User, color: '#A78BFA', emoji: '👤' },
];

// Pastel accent circles decoration
const AccentCircles = () => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#60A5FA',
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
        backgroundColor: '#A78BFA',
        opacity: 0.1,
      }}
    />
  </>
);

export function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <AccentCircles />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#60A5FA',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Menu size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>More</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                Everything else in one place ⚙️
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items Card */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 }}>
              Quick Access
            </Text>
            
            <View style={{ gap: 12 }}>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={{
                      backgroundColor: '#181A20',
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: '#3F3F46',
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
                          backgroundColor: `${item.color}20`,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>
                        {item.label}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#71717A" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* App Info Card */}
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              marginTop: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏡</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>Spona</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 4 }}>Family Connection App</Text>
              <Text style={{ fontSize: 12, color: '#71717A', marginTop: 8 }}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
