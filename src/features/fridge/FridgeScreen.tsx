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
import { StickyNote, Trash2, Plus, NotebookPen } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { createFridgeNote, deleteFridgeNote, fetchFridgeNotes } from '@/services/fridge';
import type { FridgeNote } from '@/types';
import { hapticError, hapticImpactLight, hapticSuccess } from '@/utils/haptics';

// Note colors for variety
const NOTE_COLORS = [
  { bg: '#FEF3C720', border: '#FEF3C7', accent: '#F59E0B' },
  { bg: '#FBCFE820', border: '#FBCFE8', accent: '#EC4899' },
  { bg: '#BBF7D020', border: '#BBF7D0', accent: '#22C55E' },
  { bg: '#A5F3FC20', border: '#A5F3FC', accent: '#06B6D4' },
  { bg: '#DDD6FE20', border: '#DDD6FE', accent: '#8B5CF6' },
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
        backgroundColor: '#FBBF24',
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
        backgroundColor: '#F472B6',
        opacity: 0.1,
      }}
    />
  </>
);

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
                backgroundColor: '#FBBF24',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <StickyNote size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' }}>Fridge</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>
                Quick notes for the family 📝
              </Text>
            </View>
          </View>
        </View>

        {/* New Note Card */}
        <View style={{ paddingHorizontal: 24 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Plus size={20} color="#FBBF24" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Pin a Note
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: '#181A20',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#3F3F46',
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Milk expires Friday, call mom, etc."
              placeholderTextColor="#71717A"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: '#FBBF24',
                paddingVertical: 14,
                alignItems: 'center',
                shadowColor: '#FBBF24',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#181A20" />
              ) : (
                <Text style={{ color: '#181A20', fontWeight: '600', fontSize: 16 }}>Pin Note 📌</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky Wall */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, paddingBottom: 40 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <NotebookPen size={20} color="#F472B6" />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 }}>
                Sticky Wall
              </Text>
            </View>
            
            {notes.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🗒️</Text>
                <Text style={{ fontSize: 14, color: '#71717A' }}>No notes yet. Pin your first one!</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {notes.map((note, index) => {
                  const colorScheme = NOTE_COLORS[index % NOTE_COLORS.length];
                  return (
                    <View
                      key={note.id}
                      style={{
                        backgroundColor: colorScheme.bg,
                        borderRadius: 16,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: colorScheme.accent,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={{ fontSize: 15, color: '#FFFFFF', lineHeight: 22 }}>
                            {note.content}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDelete(note.id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#EF444420',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                        <StickyNote size={14} color={colorScheme.accent} />
                        <Text style={{ fontSize: 12, color: colorScheme.accent, marginLeft: 6 }}>
                          Pinned note
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
