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

export function ShoppingScreen() {
  const { family, profile } = useAuthStore();
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
      Alert.alert('Missing info', 'Enter an item name.');
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
    } catch (error) {
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (item: ShoppingItem) => {
    try {
      setIsLoading(true);
      const updated = await toggleShoppingItem(item);
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Shopping</Text>
        <Text className="text-base text-slate-600 mt-1">Keep the pantry stocked together.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Add item</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Milk, bread, apples..."
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Add to list</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Your list</Text>
          <View className="mt-4 gap-3">
            {items.map((item) => {
              const checked = item.is_checked ?? item.is_purchased ?? false;
              return (
                <TouchableOpacity
                  key={item.id}
                  className={`rounded-2xl px-4 py-3 ${checked ? 'bg-emerald-50' : 'bg-slate-50'}`}
                  onPress={() => handleToggle(item)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-medium ${checked ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {item.title || item.name}
                    </Text>
                    <ShoppingCart size={18} color={checked ? '#10B981' : '#64748B'} />
                  </View>
                </TouchableOpacity>
              );
            })}
            {items.length === 0 && (
              <Text className="text-sm text-slate-500">No items yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
