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
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

// Note colors for variety
const NOTE_COLORS = [
  { bg: '#FEF3C720', border: '#FEF3C7', accent: '#F59E0B' },
  { bg: '#FBCFE820', border: '#FBCFE8', accent: '#EC4899' },
  { bg: '#BBF7D020', border: '#BBF7D0', accent: '#22C55E' },
  { bg: '#A5F3FC20', border: '#A5F3FC', accent: '#06B6D4' },
  { bg: '#DDD6FE20', border: '#DDD6FE', accent: '#8B5CF6' },
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
        backgroundColor: theme.primary,
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
        backgroundColor: theme.primary,
        opacity: 0.1,
      }}
    />
  </>
);

export function FridgeScreen() {
  const { family, profile } = useAuthStore();
  const { theme } = useTheme();
  const { t } = useI18n();
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
      Alert.alert(t('common.missingInfo'), t('fridge.writeQuickNote'));
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
      Alert.alert(t('common.createFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
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
      Alert.alert(t('common.deleteFailed'), error instanceof Error ? error.message : t('common.tryAgain'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AccentCircles theme={theme.colors} />
      
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
              <StickyNote size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>{t('fridge.title')}</Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                {t('fridge.subtitle')} 📝
              </Text>
            </View>
          </View>
        </View>

        {/* New Note Card */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Plus size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                {t('fridge.pinNote')}
              </Text>
            </View>
            <TextInput
              style={{
                backgroundColor: theme.colors.inputBg,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder={t('fridge.notePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                paddingVertical: 14,
                alignItems: 'center',
                ...theme.shadows.card,
              }}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{t('fridge.pinNoteCta')} 📌</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky Wall */}
        <View style={{ paddingHorizontal: 24, marginTop: 20, paddingBottom: 40 }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 24,
              padding: 20,
              ...theme.shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <NotebookPen size={20} color={theme.colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text, marginLeft: 8 }}>
                {t('fridge.stickyWall')}
              </Text>
            </View>
            
            {notes.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🗒️</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textMuted }}>{t('fridge.noNotesYet')}</Text>
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
                          <Text style={{ fontSize: 15, color: theme.colors.text, lineHeight: 22 }}>
                            {note.content}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDelete(note.id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: theme.colors.error + '20',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={16} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                        <StickyNote size={14} color={colorScheme.accent} />
                        <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 6 }}>
                          {t('fridge.pinnedNote')}
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
