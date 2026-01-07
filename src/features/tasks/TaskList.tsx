/**
 * Task List Component
 * B    const isCompleted = task.status === 'completed';
    const isPending = task.status === 'active';
    const isAssignedToMe = task.assigned_to === userProfile?.id;
    const showCompleteButton = !isAdmin && isAssignedToMe && isPending; Grid design with role-based actions
 */

import React from 'react'
import { View, Text, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native'
import { CheckCircle, Award, Clock, User } from 'lucide-react-native'
import type { TaskWithProfiles, Task } from '@/types'
import { TaskStatus, UserRole } from '@/types'
import { useAuthStore } from '@/store'

interface TaskListProps {
  tasks: Task[]
  onCompleteTask?: (taskId: string) => void
  onApproveTask?: (taskId: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function TaskList({
  tasks,
  onCompleteTask,
  onApproveTask,
  isLoading = false,
  emptyMessage = 'No tasks yet',
}: TaskListProps) {
  const userProfile = useAuthStore((state) => state.userProfile)
  const isAdmin = userProfile?.role === 'admin'

  const renderTask = ({ item: task }: { item: Task }) => {
    const isCompleted = task.status === 'completed'
    const isPending = task.status === 'active'
    const isAssignedToMe = task.assigned_to === userProfile?.id
    const showCompleteButton = !isAdmin && isAssignedToMe && isPending
    const showApproveButton = isAdmin && task.status === 'pending_approval'

    return (
      <View
        className="bg-white rounded-3xl p-4 mb-3 mx-4 shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Header Section */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {task.title}
            </Text>
            {task.description && (
              <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
                {task.description}
              </Text>
            )}
          </View>

          {/* Points Badge */}
          <View className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl px-3 py-1.5 flex-row items-center">
            <Award size={14} color="#fff" strokeWidth={2.5} />
            <Text className="text-white font-bold text-sm ml-1">
              +{task.points} XP
            </Text>
          </View>
        </View>

        {/* Meta Information */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Assigned User */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full mr-2 bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center">
              <User size={16} color="#fff" strokeWidth={2.5} />
            </View>
            <Text className="text-sm font-medium text-gray-700">
              {task.assigned_to_profile?.name || 'Unassigned'}
            </Text>
          </View>

          {/* Status Badge */}
          {isCompleted ? (
            <View className="bg-green-100 rounded-full px-3 py-1 flex-row items-center">
              <CheckCircle size={12} color="#16a34a" strokeWidth={2.5} />
              <Text className="text-green-700 font-semibold text-xs ml-1">
                Completed
              </Text>
            </View>
          ) : (
            <View className="bg-amber-100 rounded-full px-3 py-1 flex-row items-center">
              <Clock size={12} color="#d97706" strokeWidth={2.5} />
              <Text className="text-amber-700 font-semibold text-xs ml-1">
                Pending
              </Text>
            </View>
          )}
        </View>

        {/* Due Date */}
        {task.due_date && (
          <View className="mb-3">
            <Text className="text-xs text-gray-500">
              Due: {new Date(task.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {showCompleteButton && (
          <TouchableOpacity
            onPress={() => onCompleteTask?.(task.id)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl py-3 px-4 flex-row items-center justify-center active:opacity-80"
            activeOpacity={0.8}
          >
            <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            <Text className="text-white font-bold text-base ml-2">
              Mark Complete
            </Text>
          </TouchableOpacity>
        )}

        {showApproveButton && (
          <TouchableOpacity
            onPress={() => onApproveTask?.(task.id)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl py-3 px-4 flex-row items-center justify-center active:opacity-80"
            activeOpacity={0.8}
          >
            <CheckCircle size={18} color="#fff" strokeWidth={2.5} />
            <Text className="text-white font-bold text-base ml-2">
              Approve Task
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Award size={40} color="#9ca3af" strokeWidth={2} />
      </View>
      <Text className="text-gray-500 text-base font-medium">
        {emptyMessage}
      </Text>
    </View>
  )

  const renderLoader = () => (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color="#8b5cf6" />
      <Text className="text-gray-500 text-sm mt-4">Loading tasks...</Text>
    </View>
  )

  if (isLoading) {
    return renderLoader()
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item: Task) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

// Export a header component for the task list screen
export function TaskListHeader({
  onAddTask,
  taskCount,
}: {
  onAddTask?: () => void
  taskCount?: number
}) {
  const userProfile = useAuthStore((state) => state.userProfile)
  const isAdmin = userProfile?.role === 'admin'

  return (
    <View className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            Tasks
          </Text>
          {taskCount !== undefined && (
            <Text className="text-sm text-gray-500">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'} total
            </Text>
          )}
        </View>

        {isAdmin && onAddTask && (
          <TouchableOpacity
            onPress={onAddTask}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl px-6 py-3 shadow-md active:opacity-80"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">+ Add Task</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
