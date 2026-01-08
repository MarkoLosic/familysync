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
import { StickyNote, Trash2 } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createFridgeNote, deleteFridgeNote, fetchFridgeNotes } from '@/services/fridge';
import type { FridgeNote } from '@/types';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';

export function FridgeScreen() {
  const { family, profile } = useAuthStore();
  const [notes, setNotes] = useState<FridgeNote[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadNotes = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchFridgeNotes(family.id);
      setNotes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [family?.id]);

  const handleCreate = async () => {
    if (!family?.id || !profile) return;
    if (!content.trim()) {
      Alert.alert('Missing info', 'Write a quick note first.');
      return;
    }

    try {
      setIsLoading(true);
      const created = await createFridgeNote({
        family_id: family.id,
        content: content.trim(),
        created_by: profile.id ?? profile.user_id ?? null,
      });
      setNotes((prev) => [created, ...prev]);
      setContent('');
      void hapticSuccess();
    } catch (error) {
      void hapticError();
      Alert.alert('Create failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      setIsLoading(true);
      await deleteFridgeNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      void hapticImpactLight();
    } catch (error) {
      void hapticError();
      Alert.alert('Delete failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Fridge</Text>
        <Text className="text-base text-slate-600 mt-1">Quick sticky notes for the family.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">New note</Text>
          <TextInput
            className="mt-3 bg-slate-50 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Milk expires Friday, call mom, etc."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={setContent}
          />
          <TouchableOpacity
            className="mt-4 rounded-2xl bg-purple-600 py-3 items-center"
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">Pin note</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Sticky wall</Text>
          <View className="mt-4 gap-3">
            {notes.map((note) => (
              <View key={note.id} className="bg-amber-50 rounded-2xl px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-slate-900 font-medium">{note.content}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(note.id)}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center mt-2">
                  <StickyNote size={14} color="#F59E0B" />
                  <Text className="text-xs text-amber-600 ml-2">Pinned note</Text>
                </View>
              </View>
            ))}
            {notes.length === 0 && (
              <Text className="text-sm text-slate-500">No notes yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
