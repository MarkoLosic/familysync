import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createShoppingItem, fetchShoppingItems, toggleShoppingItem } from '@/services/shopping';
import type { ShoppingItem } from '@/types';
import { supabase } from '@/services/supabase';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

export function ShoppingScreen() {
  const { family, profile } = useAuthStore();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchShoppingItems(family.id);
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [family?.id]);

  useEffect(() => {
    if (!family?.id) return;
    const channel = supabase
      .channel('shopping_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_items', filter: `family_id=eq.${family.id}` },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [family?.id]);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    if (!title.trim()) {
      Alert.alert(t('common.missingInfo'), t('shopping.enterItemName'));
      return;
    }

    try {
      setIsLoading(true);
      const created = await createShoppingItem({
        family_id: family.id,
        title: title.trim(),
        created_by: profile.id ?? profile.user_id ?? null,
      });
      setItems((prev) => [created, ...prev]);
      setTitle('');
      void hapticSuccess();
    } catch (error) {
      void hapticError();
      Alert.alert(t('common.createFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    try {
      setIsLoading(true);
      const updated = await toggleShoppingItem(item);
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
      void hapticImpactLight();
    } catch (error) {
      void hapticError();
      Alert.alert(t('common.updateFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Dekorativni krugovi */}
        <View style={{ position: 'absolute', top: 50, right: -20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.orangeLight, opacity: 0.4 }} />
        <View style={{ position: 'absolute', top: 120, left: 20, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.greenLight, opacity: 0.4 }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '700' }}>{t('shopping.title')} 🛒</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16, marginTop: 8 }}>{t('shopping.subtitle')}</Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>{t('shopping.addItem')}</Text>
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
                  placeholder={t('shopping.itemPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 16,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={{ color: theme.colors.card, fontWeight: '600', fontSize: 16 }}>{t('shopping.addToList')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>{t('shopping.yourList')}</Text>
            <View style={{ marginTop: 16, gap: 12 }}>
              {items.map((item) => {
                const checked = item.is_checked ?? false;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: checked ? theme.colors.success + '20' : theme.colors.cardSecondary,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: checked ? theme.colors.success : theme.colors.border,
                    }}
                    onPress={() => handleToggle(item)}
                  >
                    <Text style={{ 
                      color: checked ? theme.colors.success : theme.colors.text, 
                      fontWeight: '500', 
                      fontSize: 16,
                      textDecorationLine: checked ? 'line-through' : 'none'
                    }}>
                      {item.title || item.name}
                    </Text>
                    <ShoppingCart size={18} color={checked ? theme.colors.success : theme.colors.textSecondary} />
                  </TouchableOpacity>
                );
              })}
              {items.length === 0 && (
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{t('shopping.noItems')}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
