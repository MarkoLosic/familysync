/**
 * Task List Screen Example
 * Demonstrates how to use the TaskList component
 */

import React, { useEffect, useState } from 'react'
import { View, SafeAreaView } from 'react-native'
import { TaskList, TaskListHeader } from '@/features/tasks/TaskList'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store'
import type { Task } from '@/types/database'

export function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { userProfile, familyDetails } = useAuthStore()

  // Fetch tasks with assigned user profiles
  const fetchTasks = async () => {
    if (!familyDetails?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(id, name, role),
          created_by_profile:profiles!tasks_created_by_fkey(id, name)
        `)
        .eq('family_id', familyDetails.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `family_id=eq.${familyDetails?.id}`,
        },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [familyDetails?.id])

  // Handle child completing a task
  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'pending_approval',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (error) throw error

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      console.error('Error completing task:', error)
      // Show error toast
    }
  }

  // Handle admin approving a task (alternative flow)
  const handleApproveTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task?.assigned_to) return

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          approved_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (error) throw error

      // Award points to assigned user
      const { data: assignedProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', task.assigned_to)
        .single()

      if (assignedProfile) {
        await supabase
          .from('profiles')
          .update({
            points: assignedProfile.points + task.points,
          })
          .eq('id', task.assigned_to)
      }

      // Refresh tasks
      await fetchTasks()
    } catch (error) {
      console.error('Error approving task:', error)
      // Show error toast
    }
  }

  const handleAddTask = () => {
    // Navigate to add task screen
    console.log('Navigate to add task screen')
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TaskListHeader
        onAddTask={handleAddTask}
        taskCount={tasks.length}
      />
      <TaskList
        tasks={tasks}
        onCompleteTask={handleCompleteTask}
        onApproveTask={handleApproveTask}
        isLoading={isLoading}
        emptyMessage="No tasks yet. Create your first task!"
      />
    </SafeAreaView>
  )
}
