/**
 * Shopping Screen
 * Real-time collaborative shopping list
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Check, Plus, ShoppingCart, Trash2 } from 'lucide-react-native'
import { COLORS } from '../../types/app'
import { useAuthStore } from '../../store/authStore'
import { ShoppingItem, ShoppingItemInsert } from '../../types/database'
import {
  getFamilyShoppingItems,
  createShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  subscribeToShoppingList,
  unsubscribeFromShoppingList,
} from '../../services/shopping'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Category configuration
const CATEGORIES = {
  food: { label: 'Food', emoji: '🍎', color: '#6ee7b7' },
  home: { label: 'Home', emoji: '🏠', color: '#60a5fa' },
  personal: { label: 'Personal', emoji: '👤', color: '#fb7185' },
  other: { label: 'Other', emoji: '📦', color: '#fbbf24' },
} as const

type Category = keyof typeof CATEGORIES

export const ShoppingScreen: React.FC = () => {
  const userProfile = useAuthStore((state) => state.userProfile)
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('food')
  const channelRef = useRef<RealtimeChannel | null>(null)
  const deleteTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Load shopping items on mount
  useEffect(() => {
    if (userProfile?.family_id) {
      loadItems()
      setupRealtimeSubscription()
    }

    return () => {
      // Clean up subscription and timers on unmount
      if (channelRef.current) {
        unsubscribeFromShoppingList(channelRef.current)
      }
      Object.values(deleteTimersRef.current).forEach(clearTimeout)
    }
  }, [userProfile?.family_id])

  // Load shopping items
  const loadItems = async () => {
    if (!userProfile?.family_id) return

    try {
      setLoading(true)
      const fetchedItems = await getFamilyShoppingItems(userProfile.family_id)
      setItems(fetchedItems)
    } catch (error) {
      console.error('Error loading shopping items:', error)
      Alert.alert('Error', 'Failed to load shopping list')
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription
  const setupRealtimeSubscription = () => {
    if (!userProfile?.family_id) return

    channelRef.current = subscribeToShoppingList(userProfile.family_id, {
      onInsert: (newItem) => {
        console.log('📥 New item added:', newItem.title)
        setItems((prev) => {
          // Avoid duplicates
          if (prev.some((item) => item.id === newItem.id)) return prev
          return [newItem, ...prev].sort((a, b) => {
            if (a.is_checked === b.is_checked) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            }
            return a.is_checked ? 1 : -1
          })
        })
      },
      onUpdate: (updatedItem) => {
        console.log('🔄 Item updated:', updatedItem.title, 'checked:', updatedItem.is_checked)
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
            .sort((a, b) => {
              if (a.is_checked === b.is_checked) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              }
              return a.is_checked ? 1 : -1
            })
        )
      },
      onDelete: (itemId) => {
        console.log('🗑️ Item deleted:', itemId)
        setItems((prev) => prev.filter((item) => item.id !== itemId))
      },
    })
  }

  // Add new shopping item
  const handleAddItem = async () => {
    if (!inputText.trim() || !userProfile?.family_id) return

    try {
      const newItem: ShoppingItemInsert = {
        family_id: userProfile.family_id,
        title: inputText.trim(),
        category: selectedCategory,
        is_checked: false,
        created_by: userProfile.id,
      }

      await createShoppingItem(newItem)
      setInputText('')
    } catch (error) {
      console.error('Error adding shopping item:', error)
      Alert.alert('Error', 'Failed to add item')
    }
  }

  // Toggle item checked status
  const handleToggleItem = async (item: ShoppingItem) => {
    try {
      const newCheckedState = !item.is_checked

      // Optimistic UI update
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_checked: newCheckedState } : i))
      )

      await toggleShoppingItem(item.id, newCheckedState)

      // If checked, schedule deletion after 5 seconds
      if (newCheckedState) {
        const timer = setTimeout(async () => {
          try {
            await deleteShoppingItem(item.id)
            delete deleteTimersRef.current[item.id]
          } catch (error) {
            console.error('Error deleting item:', error)
          }
        }, 5000)

        deleteTimersRef.current[item.id] = timer
      } else {
        // If unchecked, cancel the deletion timer
        if (deleteTimersRef.current[item.id]) {
          clearTimeout(deleteTimersRef.current[item.id])
          delete deleteTimersRef.current[item.id]
        }
      }
    } catch (error) {
      console.error('Error toggling item:', error)
      // Revert optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      )
      Alert.alert('Error', 'Failed to update item')
    }
  }

  // Manually delete item
  const handleDeleteItem = async (itemId: string) => {
    try {
      // Clear any pending deletion timer
      if (deleteTimersRef.current[itemId]) {
        clearTimeout(deleteTimersRef.current[itemId])
        delete deleteTimersRef.current[itemId]
      }

      await deleteShoppingItem(itemId)
    } catch (error) {
      console.error('Error deleting item:', error)
      Alert.alert('Error', 'Failed to delete item')
    }
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<Category, ShoppingItem[]>)

  // Render shopping item
  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const categoryConfig = CATEGORIES[item.category || 'other']

    return (
      <Animated.View className="mx-4 mb-3">
        <View
          className="bg-white rounded-2xl p-4 flex-row items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
            opacity: item.is_checked ? 0.5 : 1,
          }}
        >
          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => handleToggleItem(item)}
            className="mr-3"
          >
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{
                backgroundColor: item.is_checked ? categoryConfig.color : 'transparent',
                borderWidth: 2,
                borderColor: categoryConfig.color,
              }}
            >
              {item.is_checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
          </TouchableOpacity>

          {/* Category Emoji */}
          <Text className="text-xl mr-2">{categoryConfig.emoji}</Text>

          {/* Title */}
          <Text
            className="flex-1 text-base"
            style={{
              color: COLORS.text.primary,
              textDecorationLine: item.is_checked ? 'line-through' : 'none',
              fontWeight: item.is_checked ? '400' : '500',
            }}
          >
            {item.title}
          </Text>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={() => handleDeleteItem(item.id)}
            className="p-2"
          >
            <Trash2 size={18} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }

  // Render category section
  const renderCategorySection = (category: Category, categoryItems: ShoppingItem[]) => {
    if (categoryItems.length === 0) return null

    const config = CATEGORIES[category]
    const uncheckedCount = categoryItems.filter((item) => !item.is_checked).length

    return (
      <View key={category} className="mb-4">
        {/* Category Header */}
        <View className="flex-row items-center px-4 mb-2">
          <Text className="text-xl mr-2">{config.emoji}</Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: COLORS.text.secondary }}
          >
            {config.label} ({uncheckedCount})
          </Text>
        </View>

        {/* Category Items */}
        {categoryItems.map((item) => (
          <View key={item.id}>
            {renderItem({ item })}
          </View>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View className="px-6 pt-4 pb-6" style={{ backgroundColor: '#FFFFFF' }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold" style={{ color: COLORS.text.primary }}>
              Shopping List
            </Text>
            <Text className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
              Real-time family shopping
            </Text>
          </View>
          <View className="flex-row items-center">
            <ShoppingCart size={24} color={COLORS.primary} />
            <Text className="ml-2 text-xl font-bold" style={{ color: COLORS.primary }}>
              {items.filter((item) => !item.is_checked).length}
            </Text>
          </View>
        </View>
      </View>

      {/* Shopping List */}
      <FlatList
        data={Object.keys(CATEGORIES) as Category[]}
        renderItem={({ item: category }) =>
          renderCategorySection(category, groupedItems[category] || [])
        }
        keyExtractor={(category) => category}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <ShoppingCart size={64} color={COLORS.text.tertiary} />
            <Text className="mt-4 text-center text-base" style={{ color: COLORS.text.tertiary }}>
              Your shopping list is empty
            </Text>
            <Text className="text-sm text-center mt-1" style={{ color: COLORS.text.tertiary }}>
              Add items below to get started!
            </Text>
          </View>
        }
      />

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-4"
          style={{
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}
        >
          {/* Category Selector */}
          <View className="flex-row mb-3 gap-2">
            {(Object.keys(CATEGORIES) as Category[]).map((category) => {
              const config = CATEGORIES[category]
              const isSelected = selectedCategory === category

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className="flex-1 py-2 px-3 rounded-xl flex-row items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? config.color : COLORS.surface.secondary,
                  }}
                >
                  <Text className="text-base">{config.emoji}</Text>
                  <Text
                    className="ml-1 text-xs font-semibold"
                    style={{
                      color: isSelected ? '#FFFFFF' : COLORS.text.secondary,
                    }}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Input Field */}
          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Add item..."
              placeholderTextColor={COLORS.text.tertiary}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              className="flex-1 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: COLORS.surface.secondary,
                color: COLORS.text.primary,
                fontSize: 16,
              }}
            />
            <TouchableOpacity
              onPress={handleAddItem}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{
                backgroundColor: inputText.trim()
                  ? CATEGORIES[selectedCategory].color
                  : COLORS.surface.tertiary,
              }}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
