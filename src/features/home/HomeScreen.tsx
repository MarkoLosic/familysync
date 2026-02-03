import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ShoppingCart, 
  Clock,
  ChevronRight,
  Star,
  X,
  Sparkles
} from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { fetchTasks, updateTaskStatus } from '@/services/tasks';
import { fetchEvents, updateEvent } from '@/services/calendar';
import { deleteShoppingItem, fetchShoppingItems } from '@/services/shopping';
import { getProfilePoints } from '@/utils/profile';
import type { Task, CalendarEvent, ShoppingItem } from '@/types';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? 'Try again.');
  }
  return 'Try again.';
};

// Pastel accent circles decoration
const AccentCircles = () => (
  <>
    <View
      style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#A78BFA',
        opacity: 0.12,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 200,
        left: -80,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#60A5FA',
        opacity: 0.08,
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 100,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F472B6',
        opacity: 0.1,
      }}
    />
  </>
);

export function HomeScreen() {
  const { profile, family } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const loadData = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const [taskData, eventData, shoppingData] = await Promise.all([
        fetchTasks(family.id),
        fetchEvents(family.id),
        fetchShoppingItems(family.id),
      ]);
      setTasks(taskData);
      setEvents(eventData);
      setShopping(shoppingData);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [family?.id])
  );

  const points = getProfilePoints(profile);
  
  // Filter active items
  const pendingTasks = tasks.filter(
    (task) => task.status === 'pending' || task.status === 'waiting_approval'
  );
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.event_date).toDateString();
    const today = new Date().toDateString();
    return eventDate === today && event.status !== 'done';
  });
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate > today && event.status !== 'done';
  }).slice(0, 3);
  const shoppingOpen = shopping.filter((item) => !(item.is_checked ?? false));

  // Calculate total to-do count
  const totalTodo = pendingTasks.length + todayEvents.length + shoppingOpen.length;

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventTime(event.event_time ?? '');
    setEventDescription(event.description ?? '');
    setEventModalVisible(true);
  };

  const closeTaskModal = () => {
    setTaskModalVisible(false);
    setSelectedTask(null);
  };

  const closeEventModal = () => {
    setEventModalVisible(false);
    setSelectedEvent(null);
  };

  const handleTaskStatus = async (task: Task, status: Task['status']) => {
    try {
      setIsLoading(true);
      const completedAt =
        status === 'waiting_approval' || status === 'completed' ? new Date().toISOString() : null;
      const approvedAt = status === 'completed' ? new Date().toISOString() : null;
      const updated = await updateTaskStatus(task.id, status, {
        completed_at: completedAt,
        approved_at: approvedAt,
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
      closeTaskModal();
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventUpdate = async () => {
    if (!selectedEvent) return;
    if (!eventTitle.trim()) {
      Alert.alert('Missing info', 'Enter event title.');
      return;
    }
    try {
      setIsLoading(true);
      const updated = await updateEvent(selectedEvent.id, {
        title: eventTitle.trim(),
        event_time: eventTime.trim() || null,
        description: eventDescription.trim() || null,
      });
      setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      closeEventModal();
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClose = async () => {
    if (!selectedEvent) return;
    try {
      setIsLoading(true);
      const updated = await updateEvent(selectedEvent.id, { status: 'done' });
      setEvents((prev) => prev.filter((item) => item.id !== updated.id));
      closeEventModal();
    } catch (error) {
      Alert.alert('Close failed', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingCheck = async (item: ShoppingItem) => {
    try {
      await deleteShoppingItem(item.id);
      setShopping((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error));
    }
  };

  const handleQuickTaskComplete = async (task: Task) => {
    try {
      const updated = await updateTaskStatus(task.id, 'completed', {
        completed_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? updated : item)));
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error));
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <AccentCircles />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={loadData} 
            tintColor="#A78BFA"
          />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }}>
          <Text style={{ color: '#A1A1AA', fontSize: 16 }}>{greeting()} 👋</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
            {profile?.name ?? 'Welcome'}
          </Text>
        </View>

        {/* Summary Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 24,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={20} color="#FBBF24" />
                <Text style={{ color: '#FBBF24', fontSize: 24, fontWeight: '700', marginLeft: 8 }}>
                  {points}
                </Text>
                <Text style={{ color: '#71717A', fontSize: 14, marginLeft: 6 }}>points</Text>
              </View>
              <Text style={{ color: '#A1A1AA', fontSize: 14, marginTop: 8 }}>
                {totalTodo === 0 
                  ? "You're all caught up! 🎉" 
                  : `${totalTodo} things to do today`
                }
              </Text>
            </View>
            {totalTodo > 0 && (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: totalTodo > 5 ? '#EF444430' : totalTodo > 2 ? '#F59E0B30' : '#22C55E30',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ 
                  color: totalTodo > 5 ? '#EF4444' : totalTodo > 2 ? '#F59E0B' : '#22C55E', 
                  fontSize: 24, 
                  fontWeight: '700' 
                }}>
                  {totalTodo}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Calendar size={18} color="#60A5FA" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                Today's Events
              </Text>
              <View style={{ 
                backgroundColor: '#60A5FA30', 
                borderRadius: 12, 
                paddingHorizontal: 10, 
                paddingVertical: 4,
                marginLeft: 8
              }}>
                <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '600' }}>
                  {todayEvents.length}
                </Text>
              </View>
            </View>
            
            {todayEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={{
                  backgroundColor: '#23262F',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: '#60A5FA',
                }}
                onPress={() => openEventModal(event)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      {event.title}
                    </Text>
                    {event.event_time && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Clock size={14} color="#71717A" />
                        <Text style={{ color: '#71717A', fontSize: 13, marginLeft: 6 }}>
                          {event.event_time}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ChevronRight size={20} color="#52525B" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Tasks */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#A78BFA" />
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
              My Tasks
            </Text>
            {pendingTasks.length > 0 && (
              <View style={{ 
                backgroundColor: '#A78BFA30', 
                borderRadius: 12, 
                paddingHorizontal: 10, 
                paddingVertical: 4,
                marginLeft: 8
              }}>
                <Text style={{ color: '#A78BFA', fontSize: 12, fontWeight: '600' }}>
                  {pendingTasks.length}
                </Text>
              </View>
            )}
          </View>
          
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 20,
              padding: 16,
            }}
          >
            {pendingTasks.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
                <Text style={{ color: '#71717A', fontSize: 14 }}>No pending tasks</Text>
              </View>
            ) : (
              pendingTasks.slice(0, 5).map((task, index) => (
                <TouchableOpacity
                  key={task.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderBottomWidth: index < Math.min(pendingTasks.length - 1, 4) ? 1 : 0,
                    borderBottomColor: '#3F3F46',
                  }}
                  onPress={() => openTaskModal(task)}
                >
                  <TouchableOpacity
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: task.status === 'waiting_approval' ? '#F59E0B' : '#A78BFA',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: task.status === 'waiting_approval' ? '#F59E0B20' : 'transparent',
                    }}
                    onPress={() => handleQuickTaskComplete(task)}
                  >
                    {task.status === 'waiting_approval' && (
                      <Clock size={14} color="#F59E0B" />
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '500' }}>
                      {task.title}
                    </Text>
                    {task.status === 'waiting_approval' && (
                      <Text style={{ color: '#F59E0B', fontSize: 12, marginTop: 2 }}>
                        Awaiting approval
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    <Text style={{ color: '#FBBF24', fontSize: 13, fontWeight: '600', marginLeft: 4 }}>
                      {task.points_value ?? 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            
            {pendingTasks.length > 5 && (
              <TouchableOpacity style={{ alignItems: 'center', paddingTop: 12 }}>
                <Text style={{ color: '#A78BFA', fontSize: 14, fontWeight: '500' }}>
                  View all {pendingTasks.length} tasks
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Shopping List */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <ShoppingCart size={18} color="#F472B6" />
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
              Shopping List
            </Text>
            {shoppingOpen.length > 0 && (
              <View style={{ 
                backgroundColor: '#F472B630', 
                borderRadius: 12, 
                paddingHorizontal: 10, 
                paddingVertical: 4,
                marginLeft: 8
              }}>
                <Text style={{ color: '#F472B6', fontSize: 12, fontWeight: '600' }}>
                  {shoppingOpen.length}
                </Text>
              </View>
            )}
          </View>
          
          <View
            style={{
              backgroundColor: '#23262F',
              borderRadius: 20,
              padding: 16,
            }}
          >
            {shoppingOpen.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🛒</Text>
                <Text style={{ color: '#71717A', fontSize: 14 }}>Shopping list is empty</Text>
              </View>
            ) : (
              shoppingOpen.slice(0, 5).map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderBottomWidth: index < Math.min(shoppingOpen.length - 1, 4) ? 1 : 0,
                    borderBottomColor: '#3F3F46',
                  }}
                  onPress={() => handleShoppingCheck(item)}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: '#F472B6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Circle size={0} color="transparent" />
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '500', marginLeft: 14, flex: 1 }}>
                    {item.name}
                  </Text>
                  {item.quantity && item.quantity > 1 && (
                    <View style={{ 
                      backgroundColor: '#3F3F46', 
                      borderRadius: 8, 
                      paddingHorizontal: 8, 
                      paddingVertical: 2 
                    }}>
                      <Text style={{ color: '#A1A1AA', fontSize: 12 }}>x{item.quantity}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
            
            {shoppingOpen.length > 5 && (
              <TouchableOpacity style={{ alignItems: 'center', paddingTop: 12 }}>
                <Text style={{ color: '#F472B6', fontSize: 14, fontWeight: '500' }}>
                  View all {shoppingOpen.length} items
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Clock size={18} color="#34D399" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
                Coming Up
              </Text>
            </View>
            
            <View
              style={{
                backgroundColor: '#23262F',
                borderRadius: 20,
                padding: 16,
              }}
            >
              {upcomingEvents.map((event, index) => {
                const eventDate = new Date(event.event_date);
                const dayName = eventDate.toLocaleDateString('en', { weekday: 'short' });
                const dayNum = eventDate.getDate();
                
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: index < upcomingEvents.length - 1 ? 1 : 0,
                      borderBottomColor: '#3F3F46',
                    }}
                    onPress={() => openEventModal(event)}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: '#34D39920',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#34D399', fontSize: 10, fontWeight: '600' }}>{dayName}</Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{dayNum}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '500' }}>
                        {event.title}
                      </Text>
                      {event.event_time && (
                        <Text style={{ color: '#71717A', fontSize: 13, marginTop: 2 }}>
                          {event.event_time}
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={18} color="#52525B" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Task Modal */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeTaskModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Task Details</Text>
              <TouchableOpacity onPress={closeTaskModal}>
                <X size={24} color="#71717A" />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                  {selectedTask.title}
                </Text>
                {selectedTask.description && (
                  <Text style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 16 }}>
                    {selectedTask.description}
                  </Text>
                )}
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                  <Star size={18} color="#FBBF24" fill="#FBBF24" />
                  <Text style={{ color: '#FBBF24', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>
                    {selectedTask.points_value ?? 0} points
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#22C55E',
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}
                    onPress={() => handleTaskStatus(selectedTask, 'completed')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>✓ Complete</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#3F3F46',
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}
                    onPress={() => handleTaskStatus(selectedTask, 'postponed')}
                    disabled={isLoading}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Later</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Event Modal */}
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeEventModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#23262F',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Event Details</Text>
              <TouchableOpacity onPress={closeEventModal}>
                <X size={24} color="#71717A" />
              </TouchableOpacity>
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
                marginBottom: 12,
              }}
              placeholder="Event title"
              placeholderTextColor="#71717A"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            
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
                marginBottom: 12,
              }}
              placeholder="Time (e.g., 14:00)"
              placeholderTextColor="#71717A"
              value={eventTime}
              onChangeText={setEventTime}
            />
            
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
                marginBottom: 20,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Description (optional)"
              placeholderTextColor="#71717A"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#60A5FA',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                onPress={handleEventUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#22C55E',
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                onPress={handleEventClose}
                disabled={isLoading}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>✓ Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
