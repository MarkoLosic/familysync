import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {
  Trash2,
  BookOpen,
  Home as HomeIcon,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react-native';
import type { Task } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface TaskItemProps {
  task: Task;
  isParent: boolean;
  currentUserId: string;
  onComplete: (taskId: string) => void;
  onApprove: (task: Task) => void;
  onReject: (taskId: string) => void;
}

export function TaskItem({
  task,
  isParent,
  currentUserId,
  onComplete,
  onApprove,
  onReject,
}: TaskItemProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const isMyTask = task.assigned_to === currentUserId;
  const isChild = !isParent;
  const canSwipeToComplete =
    isChild && isMyTask && task.status === 'active';
  const needsApproval =
    isParent && task.status === 'pending_approval';

  // Get icon based on category
  const getIcon = () => {
    switch (task.category) {
      case 'chore':
        return <HomeIcon size={24} color="#8B5CF6" />;
      case 'homework':
        return <BookOpen size={24} color="#3B82F6" />;
      default:
        return <MoreHorizontal size={24} color="#EC4899" />;
    }
  };

  // Get status color and text
  const getStatusInfo = () => {
    switch (task.status) {
      case 'completed':
        return {
          color: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle2 size={16} color="#15803D" />,
          text: 'Completed',
        };
      case 'pending_approval':
        return {
          color: 'bg-orange-100',
          textColor: 'text-orange-700',
          icon: <Clock size={16} color="#C2410C" />,
          text: 'Waiting Approval',
        };
      case 'rejected':
        return {
          color: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle size={16} color="#B91C1C" />,
          text: 'Rejected',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  // Pan responder for swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canSwipeToComplete,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        canSwipeToComplete && Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Complete the task with animation
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowConfetti(true);
            setTimeout(() => {
              onComplete(task.id);
              // Reset animations
              translateX.setValue(0);
              opacity.setValue(1);
              setShowConfetti(false);
            }, 800);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Approval card (for parents)
  if (needsApproval && isParent) {
    return (
      <View className="mb-4">
        <View className="bg-white rounded-3xl shadow-sm p-6">
          <View className="flex-row items-start">
            {/* Icon */}
            <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center mr-4">
              {getIcon()}
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {task.title}
              </Text>
              {task.description && (
                <Text className="text-sm text-gray-600 mb-2">
                  {task.description}
                </Text>
              )}
              <View className="flex-row items-center mt-2">
                {task.assigned_to_profile && (
                  <View className="flex-row items-center mr-4">
                    <View className="w-6 h-6 bg-pink-500 rounded-full items-center justify-center mr-2">
                      <Text className="text-white text-xs font-bold">
                        {task.assigned_to_profile.name[0]}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600">
                      {task.assigned_to_profile.name}
                    </Text>
                  </View>
                )}
                <View className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center">
                  <Clock size={14} color="#C2410C" />
                  <Text className="text-orange-700 text-xs font-semibold ml-1">
                    Needs Review
                  </Text>
                </View>
              </View>
            </View>

            {/* Points Badge */}
            <View className="bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-2 rounded-full ml-2">
              <Text className="text-white font-bold text-sm">
                +{task.points}
              </Text>
              <Text className="text-white text-xs">XP</Text>
            </View>
          </View>

          {/* Approval Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 bg-green-500 py-3 rounded-2xl items-center"
              onPress={() => onApprove(task)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <CheckCircle2 size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Approve</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-red-500 py-3 rounded-2xl items-center"
              onPress={() => onReject(task.id)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <XCircle size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Reject</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Regular task card
  return (
    <View className="mb-4">
      {/* Swipe Background (Complete Action) */}
      {canSwipeToComplete && (
        <View className="absolute inset-0 bg-green-500 rounded-3xl items-center justify-center flex-row">
          <CheckCircle2 size={32} color="white" />
          <Text className="text-white font-bold text-lg ml-3">
            Complete Task!
          </Text>
        </View>
      )}

      {/* Confetti Overlay */}
      {showConfetti && (
        <View className="absolute inset-0 bg-purple-500 rounded-3xl items-center justify-center z-50">
          <Text className="text-6xl">🎉</Text>
          <Text className="text-white font-bold text-xl mt-2">
            +{task.points} XP!
          </Text>
        </View>
      )}

      {/* Task Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
          opacity,
        }}
        {...(canSwipeToComplete ? panResponder.panHandlers : {})}
      >
        <View className="bg-white rounded-3xl shadow-sm p-6">
          <View className="flex-row items-center">
            {/* Icon */}
            <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center mr-4">
              {getIcon()}
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {task.title}
              </Text>
              {task.description && (
                <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              <View className="flex-row items-center">
                {task.assigned_to_profile && (
                  <View className="flex-row items-center mr-3">
                    <View className="w-6 h-6 bg-pink-500 rounded-full items-center justify-center mr-2">
                      <Text className="text-white text-xs font-bold">
                        {task.assigned_to_profile.name[0]}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-600">
                      {task.assigned_to_profile.name}
                    </Text>
                  </View>
                )}
                {statusInfo && (
                  <View
                    className={`${statusInfo.color} px-3 py-1 rounded-full flex-row items-center`}
                  >
                    {statusInfo.icon}
                    <Text className={`${statusInfo.textColor} text-xs font-semibold ml-1`}>
                      {statusInfo.text}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Points Badge */}
            <View className="bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-2 rounded-full ml-2">
              <Text className="text-white font-bold text-sm">
                +{task.points}
              </Text>
              <Text className="text-white text-xs">XP</Text>
            </View>
          </View>

          {/* Swipe Hint */}
          {canSwipeToComplete && (
            <View className="mt-3 bg-green-50 px-4 py-2 rounded-2xl">
              <Text className="text-green-700 text-xs text-center font-medium">
                👉 Swipe right to complete
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
