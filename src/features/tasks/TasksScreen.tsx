import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store';
import { TaskItem } from './TaskItem';
import { supabase } from '@/services/supabase';
import type { Task } from '@/types/database';
import { CheckCircle2, Users, Plus } from 'lucide-react-native';

type TabType = 'my-tasks' | 'family-tasks';

export function TasksScreen() {
  const { userProfile, familyDetails } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('my-tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isParent = userProfile?.role === 'admin';

  // Fetch tasks based on active tab
  const fetchTasks = async (showRefreshIndicator = false) => {
    if (!userProfile?.family_id) return;

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(
            id,
            name,
            role
          ),
          created_by_profile:profiles!tasks_created_by_fkey(
            id,
            name
          )
        `)
        .eq('family_id', userProfile.family_id)
        .order('created_at', { ascending: false });

      // Filter based on tab
      if (activeTab === 'my-tasks') {
        query = query.eq('assigned_to', userProfile.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab, userProfile?.family_id]);

  // Handle task completion (child)
  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending_approval',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh the list
      await fetchTasks(true);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Handle task approval (parent)
  const handleApproveTask = async (task: Task) => {
    if (!task.assigned_to) return;

    try {
      // Update task status
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          approved_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // Get current points
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', task.assigned_to)
        .single();

      if (fetchError) throw fetchError;

      // Award points to the assigned user
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ 
          points: (profile?.points || 0) + task.points,
        })
        .eq('id', task.assigned_to);

      if (pointsError) throw pointsError;

      // Refresh the list
      await fetchTasks(true);
    } catch (error) {
      console.error('Error approving task:', error);
    }
  };

  // Handle task rejection (parent)
  const handleRejectTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'active',
          completed_at: null,
        })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh the list
      await fetchTasks(true);
    } catch (error) {
      console.error('Error rejecting task:', error);
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <CheckCircle2 size={64} color="#D8B4FE" />
      <Text className="text-xl font-bold text-gray-900 mt-6 text-center">
        {activeTab === 'my-tasks' 
          ? 'No tasks assigned to you!'
          : 'No family tasks yet!'}
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        {activeTab === 'my-tasks'
          ? 'Enjoy your free time 🎉'
          : 'Create tasks to get started'}
      </Text>
    </View>
  );

  const myTasks = tasks.filter(t => t.assigned_to === userProfile?.id);
  const familyTasks = tasks;

  const displayTasks = activeTab === 'my-tasks' ? myTasks : familyTasks;

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-purple-900">Tasks</Text>
            {familyDetails && (
              <Text className="text-sm text-purple-600 mt-1">
                {familyDetails.name}
              </Text>
            )}
          </View>

          {/* Quick Add Button */}
          <TouchableOpacity
            className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-full items-center justify-center shadow-md"
            activeOpacity={0.7}
          >
            <Plus size={24} color="white" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white rounded-full p-1 shadow-sm">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-full items-center ${
              activeTab === 'my-tasks' ? 'bg-purple-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('my-tasks')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <CheckCircle2
                size={18}
                color={activeTab === 'my-tasks' ? '#FFFFFF' : '#8B5CF6'}
              />
              <Text
                className={`ml-2 font-semibold ${
                  activeTab === 'my-tasks' ? 'text-white' : 'text-purple-600'
                }`}
              >
                My Tasks
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-full items-center ${
              activeTab === 'family-tasks' ? 'bg-purple-500' : 'bg-transparent'
            }`}
            onPress={() => setActiveTab('family-tasks')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Users
                size={18}
                color={activeTab === 'family-tasks' ? '#FFFFFF' : '#8B5CF6'}
              />
              <Text
                className={`ml-2 font-semibold ${
                  activeTab === 'family-tasks' ? 'text-white' : 'text-purple-600'
                }`}
              >
                Family Tasks
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={displayTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              isParent={isParent}
              currentUserId={userProfile?.id || ''}
              onComplete={handleCompleteTask}
              onApprove={handleApproveTask}
              onReject={handleRejectTask}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchTasks(true)}
              tintColor="#8B5CF6"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
