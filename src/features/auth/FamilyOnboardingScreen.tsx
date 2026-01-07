/**
 * Family Onboarding Screen
 * Create or join a family after registration
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Home, Plus, Users, Key } from 'lucide-react-native'
import { createFamily, joinFamilyByInviteCode } from '@/services/family'
import { useAuthStore, useSession } from '@/store'

type OnboardingMode = 'select' | 'create' | 'join'

export function FamilyOnboardingScreen() {
  const [mode, setMode] = useState<OnboardingMode>('select')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null)

  const session = useSession()
  const fetchProfileAndFamily = useAuthStore((state) => state.fetchProfileAndFamily)

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Missing Information', 'Please enter a family name')
      return
    }

    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in')
      return
    }

    try {
      setIsLoading(true)

      const { family, inviteCode } = await createFamily(
        familyName.trim(),
        session.user.id
      )

      setCreatedInviteCode(inviteCode)

      // Refresh profile to get updated family data
      await fetchProfileAndFamily()

      Alert.alert(
        '🎉 Family Created!',
        `Your family "${family.name}" has been created!\n\nInvite Code: ${inviteCode}\n\nShare this code with family members so they can join.`,
        [
          {
            text: 'Got it!',
            onPress: () => {
              // Navigation will be handled by parent based on store state
            },
          },
        ]
      )
    } catch (error) {
      console.error('Error creating family:', error)
      Alert.alert(
        'Failed to Create Family',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Missing Information', 'Please enter an invite code')
      return
    }

    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in')
      return
    }

    try {
      setIsLoading(true)

      const family = await joinFamilyByInviteCode(inviteCode.trim().toUpperCase(), session.user.id)

      // Refresh profile to get updated family data
      await fetchProfileAndFamily()

      Alert.alert(
        '🎊 Welcome!',
        `You've successfully joined "${family.name}"!`,
        [
          {
            text: 'Let\'s Go!',
            onPress: () => {
              // Navigation will be handled by parent based on store state
            },
          },
        ]
      )
    } catch (error) {
      console.error('Error joining family:', error)
      Alert.alert(
        'Failed to Join Family',
        error instanceof Error ? error.message : 'Please check the invite code and try again'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const renderSelectMode = () => (
    <View className="flex-1 justify-center px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <View className="bg-white rounded-full p-6 mb-4 shadow-lg">
          <Text className="text-5xl">👨‍👩‍👧‍👦</Text>
        </View>
        <Text className="text-4xl font-bold text-slate-900 mb-2 text-center">
          Family Setup
        </Text>
        <Text className="text-lg text-slate-600 text-center">
          Create a new family or join an existing one
        </Text>
      </View>

      {/* Options */}
      <View className="space-y-4">
        {/* Create Family Option */}
        <TouchableOpacity
          onPress={() => setMode('create')}
          className="rounded-3xl shadow-lg"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6ee7b7', '#34d399']} // Mint green gradient
            className="rounded-3xl p-6"
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-white rounded-full p-3 mr-4">
                <Plus size={28} color="#34d399" strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-bold text-white">
                Create Family
              </Text>
            </View>
            <Text className="text-white text-base opacity-90">
              Start a new family and get an invite code to share with others
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Join Family Option */}
        <TouchableOpacity
          onPress={() => setMode('join')}
          className="rounded-3xl shadow-lg"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7dd3fc', '#3b82f6']} // Sky blue gradient
            className="rounded-3xl p-6"
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-white rounded-full p-3 mr-4">
                <Users size={28} color="#3b82f6" strokeWidth={2.5} />
              </View>
              <Text className="text-2xl font-bold text-white">
                Join Family
              </Text>
            </View>
            <Text className="text-white text-base opacity-90">
              Enter an invite code to join an existing family
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderCreateMode = () => (
    <View className="flex-1 justify-center px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <View className="bg-white rounded-full p-6 mb-4 shadow-lg">
          <Home size={40} color="#34d399" strokeWidth={2} />
        </View>
        <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">
          Create Your Family
        </Text>
        <Text className="text-base text-slate-600 text-center">
          Choose a name for your family
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-6">
        {/* Family Name Input */}
        <View>
          <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
            Family Name
          </Text>
          <View className="bg-white rounded-3xl px-6 py-5 shadow-lg">
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="The Smith Family"
              placeholderTextColor="#94a3b8"
              className="text-lg text-slate-900"
              editable={!isLoading}
              autoFocus
            />
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreateFamily}
          disabled={isLoading}
          className={`rounded-full shadow-lg ${isLoading ? 'opacity-50' : ''}`}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#6ee7b7', '#34d399']}
            className="rounded-full py-5 flex-row items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Plus size={24} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-lg ml-2">
                  Create Family
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setMode('select')}
          disabled={isLoading}
          className="py-4"
        >
          <Text className="text-slate-600 font-semibold text-center text-base">
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderJoinMode = () => (
    <View className="flex-1 justify-center px-6">
      {/* Header */}
      <View className="items-center mb-12">
        <View className="bg-white rounded-full p-6 mb-4 shadow-lg">
          <Key size={40} color="#3b82f6" strokeWidth={2} />
        </View>
        <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">
          Join a Family
        </Text>
        <Text className="text-base text-slate-600 text-center">
          Enter the 6-character invite code
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-6">
        {/* Invite Code Input */}
        <View>
          <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
            Invite Code
          </Text>
          <View className="bg-white rounded-3xl px-6 py-5 shadow-lg">
            <TextInput
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              placeholder="ABC123"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              maxLength={6}
              className="text-2xl text-slate-900 text-center font-bold tracking-widest"
              editable={!isLoading}
              autoFocus
            />
          </View>
          <Text className="text-xs text-slate-500 text-center mt-2">
            Ask a family member for the invite code
          </Text>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          onPress={handleJoinFamily}
          disabled={isLoading}
          className={`rounded-full shadow-lg ${isLoading ? 'opacity-50' : ''}`}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7dd3fc', '#3b82f6']}
            className="rounded-full py-5 flex-row items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Users size={24} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-lg ml-2">
                  Join Family
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => setMode('select')}
          disabled={isLoading}
          className="py-4"
        >
          <Text className="text-slate-600 font-semibold text-center text-base">
            ← Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <LinearGradient
      colors={['#f0f9ff', '#fef3c7', '#fce7f3']} // Sky -> Amber -> Pink
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mode === 'select' && renderSelectMode()}
          {mode === 'create' && renderCreateMode()}
          {mode === 'join' && renderJoinMode()}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
