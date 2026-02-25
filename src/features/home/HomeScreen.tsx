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
  Calendar, 
  ShoppingCart, 
  Clock,
  ChevronRight,
  Star,
  X,
  Search,
  Filter,
  MessageCircle,
} from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { useTheme } from '@/theme';
import { fetchTasks, updateTaskStatus } from '@/services/tasks';
import { fetchEvents, updateEvent } from '@/services/calendar';
import { deleteShoppingItem, fetchShoppingItems } from '@/services/shopping';
import { getProfilePoints } from '@/utils/profile';
import type { Task, CalendarEvent, ShoppingItem } from '@/types';
import { useI18n } from '@/i18n';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? fallback);
  }
  return fallback;
};

// Filter tabs component
const FilterTabs = ({ 
  selected, 
  onSelect, 
  tabs,
  theme,
}: { 
  selected: string; 
  onSelect: (tab: string) => void;
  tabs: Array<{ key: string; label: string }>;
  theme: any;
}) => {
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onSelect(tab.key)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: selected === tab.key
              ? theme.colors.primary
              : theme.colors.card,
            borderWidth: selected !== tab.key ? 1 : 0,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ 
            color: selected === tab.key
              ? theme.colors.text 
              : theme.colors.textSecondary,
            fontWeight: '500',
            fontSize: 14,
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Progress bar component
const ProgressBar = ({ progress, color, theme }: { progress: number; color: string; theme: any }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <View style={{ 
      height: 8, 
      width: 40, 
      backgroundColor: color, 
      borderRadius: 4 
    }} />
    <View style={{ 
      height: 8, 
      flex: 1, 
      backgroundColor: theme.colors.cardSecondary, 
      borderRadius: 4,
      overflow: 'hidden'
    }}>
      <View style={{ 
        height: '100%', 
        width: `${Math.min(progress, 100)}%`, 
        backgroundColor: color,
        borderRadius: 4,
      }} />
    </View>
  </View>
);

// Status badge component
const StatusBadge = ({ statusKey, label, theme }: { statusKey: string; label: string; theme: any }) => {
  const getStatusStyle = () => {
    switch (statusKey) {
      case 'progress':
        return { 
          bg: theme.colors.greenLight, 
          text: theme.colors.success 
        };
      case 'todo':
        return { 
          bg: theme.colors.primaryLight, 
          text: theme.colors.primary 
        };
      case 'done':
        return { 
          bg: theme.colors.cardSecondary, 
          text: theme.colors.textSecondary 
        };
      default:
        return { 
          bg: theme.colors.cardSecondary, 
          text: theme.colors.textSecondary 
        };
    }
  };
  
  const style = getStatusStyle();
  
  return (
    <View style={{
      backgroundColor: style.bg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    }}>
      <Text style={{ color: style.text, fontSize: 12, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
};

export function HomeScreen() {
  const { profile, family } = useAuthStore();
  const { theme } = useTheme();
  const { t, language } = useI18n();
  const isLight = theme.name !== 'dark';
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
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
  const filterTabs = [
    { key: 'all', label: t('home.filterAll') },
    { key: 'todo', label: t('home.filterToDo') },
    { key: 'progress', label: t('home.filterInProgress') },
    { key: 'done', label: t('home.filterDone') },
  ];
  
  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    switch (selectedFilter) {
      case 'todo':
        return tasks.filter(t => t.status === 'pending');
      case 'progress':
        return tasks.filter(t => t.status === 'waiting_approval');
      case 'done':
        return tasks.filter(t => t.status === 'completed');
      default:
        return tasks;
    }
  };
  
  const filteredTasks = getFilteredTasks();
  const shoppingOpen = shopping.filter((item) => !(item.is_checked ?? false));

  const getTaskStatus = (task: Task) => {
    switch (task.status) {
      case 'pending': return 'todo';
      case 'waiting_approval': return 'progress';
      case 'completed': return 'done';
      default: return 'todo';
    }
  };

  const getTaskStatusLabel = (statusKey: string) => {
    switch (statusKey) {
      case 'todo':
        return t('home.filterToDo');
      case 'progress':
        return t('home.filterInProgress');
      case 'done':
        return t('home.filterDone');
      default:
        return t('home.filterToDo');
    }
  };

  const getTaskProgress = (task: Task) => {
    switch (task.status) {
      case 'completed': return 100;
      case 'waiting_approval': return 60;
      default: return 0;
    }
  };

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
      Alert.alert(t('common.updateFailed'), getErrorMessage(error, t('common.tryAgain')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventUpdate = async () => {
    if (!selectedEvent) return;
    if (!eventTitle.trim()) {
      Alert.alert(t('common.missingInfo'), t('calendar.enterEventTitle'));
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
      Alert.alert(t('common.updateFailed'), getErrorMessage(error, t('common.tryAgain')));
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
      Alert.alert(t('home.closeFailed'), getErrorMessage(error, t('common.tryAgain')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingCheck = async (item: ShoppingItem) => {
    try {
      await deleteShoppingItem(item.id);
      setShopping((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      Alert.alert(t('common.updateFailed'), getErrorMessage(error, t('common.tryAgain')));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={loadData} 
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingTop: 60, 
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: 28, 
            fontWeight: '700' 
          }}>
            {t('home.title')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isLight ? '#FFFFFF' : theme.colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: isLight ? 1 : 0,
                borderColor: theme.colors.border,
              }}
            >
              <Search size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isLight ? '#FFFFFF' : theme.colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: isLight ? 1 : 0,
                borderColor: theme.colors.border,
              }}
            >
              <Clock size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
          <FilterTabs 
            selected={selectedFilter} 
            onSelect={setSelectedFilter}
            tabs={filterTabs}
            theme={theme}
          />
        </View>

        {/* Sort & Filter Row */}
        <View style={{ 
          paddingHorizontal: 24, 
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Filter size={16} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{t('home.filters')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{t('home.sortBy')}</Text>
          </TouchableOpacity>
        </View>

        {/* Task Cards */}
        <View style={{ paddingHorizontal: 24, gap: 16 }}>
          {filteredTasks.length === 0 ? (
            <View style={{ 
              backgroundColor: theme.colors.card, 
              borderRadius: 20, 
              padding: 40,
              alignItems: 'center',
              ...theme.shadows.card,
            }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>
                {t('home.noTasksInCategory')}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const status = getTaskStatus(task);
              const progress = getTaskProgress(task);
              const progressColor = status === 'progress' ? '#A4F5A6' : 
                                   status === 'done' ? '#E5E7EB' : '#A28EF9';
              
              return (
                <TouchableOpacity
                  key={task.id}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 20,
                    padding: 20,
                    ...theme.shadows.card,
                  }}
                  onPress={() => openTaskModal(task)}
                  activeOpacity={0.7}
                >
                  {/* Status Badge */}
                  <StatusBadge statusKey={status} label={getTaskStatusLabel(status)} theme={theme} />
                  
                  {/* Task Title */}
                  <Text style={{ 
                    color: theme.colors.text, 
                    fontSize: 18, 
                    fontWeight: '600',
                    marginTop: 12,
                    marginBottom: 8,
                  }}>
                    {task.title}
                  </Text>
                  
                  {/* Task Description */}
                  {task.description && (
                    <Text style={{ 
                      color: theme.colors.textSecondary, 
                      fontSize: 14,
                      marginBottom: 12,
                    }}>
                      {task.description}
                    </Text>
                  )}
                  
                  {/* Meta Info */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                        {new Date().toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MessageCircle size={14} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                        {task.points_value ?? 0} {t('common.pointsLower')}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar */}
                  <ProgressBar progress={progress} color={progressColor} theme={theme} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Shopping Quick View */}
        {shoppingOpen.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ 
              color: theme.colors.text, 
              fontSize: 18, 
              fontWeight: '600',
              marginBottom: 12,
            }}>
              {t('home.shoppingList')} ({shoppingOpen.length})
            </Text>
            <View style={{
              backgroundColor: theme.colors.card,
              borderRadius: 20,
              padding: 16,
              ...theme.shadows.card,
            }}>
              {shoppingOpen.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: index < Math.min(shoppingOpen.length - 1, 2) ? 1 : 0,
                    borderBottomColor: theme.colors.border,
                  }}
                  onPress={() => handleShoppingCheck(item)}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: theme.colors.orange,
                    marginRight: 12,
                  }} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, flex: 1 }}>
                    {item.title || item.name}
                  </Text>
                  {item.quantity && item.quantity > 1 && (
                    <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                      x{item.quantity}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 20 
            }}>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>
                {t('home.taskDetails')}
              </Text>
              <TouchableOpacity onPress={closeTaskModal}>
                <X size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <>
                <StatusBadge
                  statusKey={getTaskStatus(selectedTask)}
                  label={getTaskStatusLabel(getTaskStatus(selectedTask))}
                  theme={theme}
                />
                
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 18, 
                  fontWeight: '600', 
                  marginTop: 16,
                  marginBottom: 8 
                }}>
                  {selectedTask.title}
                </Text>
                
                {selectedTask.description && (
                  <Text style={{ 
                    color: theme.colors.textSecondary, 
                    fontSize: 14, 
                    marginBottom: 16 
                  }}>
                    {selectedTask.description}
                  </Text>
                )}
                
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginBottom: 24 
                }}>
                  <Star size={18} color={theme.colors.orange} fill={theme.colors.orange} />
                  <Text style={{ 
                    color: theme.colors.orange, 
                    fontSize: 16, 
                    fontWeight: '600', 
                    marginLeft: 6 
                  }}>
                    {selectedTask.points_value ?? 0} {t('common.pointsLower')}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.green,
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}
                    onPress={() => handleTaskStatus(selectedTask, 'completed')}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={isLight ? '#1A1A1A' : '#FFFFFF'} />
                    ) : (
                      <Text style={{ 
                        color: isLight ? '#1A1A1A' : '#FFFFFF', 
                        fontWeight: '600', 
                        fontSize: 16 
                      }}>
                        ✓ {t('home.complete')}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.cardSecondary,
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                    }}
                    onPress={() => handleTaskStatus(selectedTask, 'postponed')}
                    disabled={isLoading}
                  >
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontWeight: '600', 
                      fontSize: 16 
                    }}>
                      {t('common.later')}
                    </Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 20 
            }}>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>
                {t('home.eventDetails')}
              </Text>
              <TouchableOpacity onPress={closeEventModal}>
                <X size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
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
                marginBottom: 12,
              }}
              placeholder={t('calendar.eventTitle')}
              placeholderTextColor={theme.colors.textMuted}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            
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
                marginBottom: 12,
              }}
              placeholder={t('home.timePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={eventTime}
              onChangeText={setEventTime}
            />
            
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
                marginBottom: 20,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder={t('common.descriptionOptional')}
              placeholderTextColor={theme.colors.textMuted}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
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
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.green,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                onPress={handleEventClose}
                disabled={isLoading}
              >
                <Text style={{ 
                  color: isLight ? '#1A1A1A' : '#FFFFFF', 
                  fontWeight: '600', 
                  fontSize: 16 
                }}>
                  ✓ {t('common.done')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
