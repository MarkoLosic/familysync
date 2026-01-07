import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@/navigation';
import {
  Calendar,
  CheckCircle2,
  ShoppingCart,
  Home,
  MapPin,
  Gift,
  Clock,
  Users,
} from 'lucide-react-native';
import { useAuthStore } from '@/store';

type NavigationProp = BottomTabNavigationProp<MainTabParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { userProfile, familyDetails } = useAuthStore();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data - you'll replace this with real data later
  const todaysTasks = [
    { id: 1, title: 'Take out the trash', assignee: 'Dad', urgent: true },
    { id: 2, title: 'Finish homework', assignee: 'Kids', urgent: true },
  ];

  const shoppingList = [
    { id: 1, item: 'Milk', checked: false },
    { id: 2, item: 'Bread', checked: false },
    { id: 3, item: 'Eggs', checked: true },
  ];

  const familyStatus = [
    { name: 'Dad', status: 'home', color: '#8B5CF6' },
    { name: 'Mom', status: 'work', color: '#EC4899' },
    { name: 'Emma', status: 'school', color: '#3B82F6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Greeting */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                {getGreeting()},
              </Text>
              <Text style={styles.greetingName}>
                {userProfile?.name || 'Friend'}! 👋
              </Text>
              {familyDetails && (
                <Text style={styles.familyName}>
                  {familyDetails.name}
                </Text>
              )}
            </View>

            {/* Family Avatar Group */}
            <View style={styles.avatarGroup}>
              {familyStatus.map((member, index) => (
                <View
                  key={member.name}
                  style={{
                    marginLeft: index > 0 ? -12 : 0,
                    zIndex: familyStatus.length - index,
                  }}
                >
                  <View
                    style={[styles.avatar, { backgroundColor: member.color }]}
                  >
                    <Text style={styles.avatarText}>
                      {member.name[0]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Row 1: Big Widget (2x2) + Tall Widget (1x2) */}
          <View style={styles.row}>
            {/* Big Widget: Today's Focus (2x2) */}
            <TouchableOpacity 
              style={styles.bigWidget}
              onPress={() => navigation.navigate('Tasks')}
              activeOpacity={0.9}
            >
              <View style={styles.widgetCard}>
                {/* Header */}
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetHeaderText}>
                    Today's Focus
                  </Text>
                </View>

                {/* Content */}
                {todaysTasks.length > 0 ? (
                  <View style={styles.widgetContent}>
                    <View style={styles.taskInfo}>
                      <View style={styles.taskMeta}>
                        <Calendar size={20} color="#8B5CF6" />
                        <Text style={styles.urgentLabel}>
                          Most Urgent
                        </Text>
                      </View>
                      <Text style={styles.taskTitle}>
                        {todaysTasks[0].title}
                      </Text>
                      <Text style={styles.taskAssignee}>
                        Assigned to: {todaysTasks[0].assignee}
                      </Text>
                    </View>

                    {/* Progress */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                          Tasks today
                        </Text>
                        <Text style={styles.progressCount}>
                          {todaysTasks.length}
                        </Text>
                      </View>
                      <View className="h-2 bg-purple-100 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: '30%' }}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <CheckCircle2 size={48} color="#D8B4FE" />
                    <Text className="text-gray-400 mt-4 text-center">
                      No tasks for today!{'\n'}Enjoy your free time 🎉
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Tall Widget: Shopping List (1x2) */}
            <TouchableOpacity 
              className="w-32" 
              style={{ minHeight: 280 }}
              onPress={() => navigation.navigate('Shopping')}
              activeOpacity={0.9}
            >
              <View className="bg-white rounded-3xl shadow-sm p-4 h-full">
                {/* Header */}
                <View className="bg-pink-100 rounded-2xl px-3 py-2 mb-4">
                  <Text className="text-pink-900 font-semibold text-xs text-center">
                    Shopping
                  </Text>
                </View>

                {/* Shopping Items */}
                <View className="flex-1">
                  {shoppingList.slice(0, 3).map((item, index) => (
                    <View
                      key={item.id}
                      className={`mb-3 ${
                        item.checked ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-md border-2 items-center justify-center ${
                            item.checked
                              ? 'bg-pink-500 border-pink-500'
                              : 'border-pink-300'
                          }`}
                        >
                          {item.checked && (
                            <Text className="text-white text-xs">✓</Text>
                          )}
                        </View>
                      </View>
                      <Text
                        className={`text-xs mt-1 ${
                          item.checked
                            ? 'text-gray-400 line-through'
                            : 'text-gray-700'
                        }`}
                        numberOfLines={2}
                      >
                        {item.item}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Icon */}
                <View className="items-center mt-2">
                  <ShoppingCart size={24} color="#F9A8D4" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2: Wide Widget (2x1) - Family Status */}
          <View className="mb-4">
            <View className="bg-white rounded-3xl shadow-sm p-6">
              {/* Header */}
              <View className="bg-blue-100 rounded-2xl px-4 py-2 mb-4 self-start">
                <Text className="text-blue-900 font-semibold text-sm">
                  Family Status
                </Text>
              </View>

              {/* Family Members */}
              <View className="flex-row justify-between items-center">
                {familyStatus.map((member) => (
                  <View key={member.name} className="items-center flex-1">
                    {/* Avatar */}
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: member.color }}
                    >
                      <Text className="text-white font-bold text-lg">
                        {member.name[0]}
                      </Text>
                    </View>

                    {/* Name */}
                    <Text className="text-gray-900 font-semibold text-sm mb-1">
                      {member.name}
                    </Text>

                    {/* Status Badge */}
                    <View
                      className={`flex-row items-center px-3 py-1 rounded-full ${
                        member.status === 'home'
                          ? 'bg-green-100'
                          : member.status === 'work'
                          ? 'bg-orange-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <MapPin
                        size={10}
                        color={
                          member.status === 'home'
                            ? '#22C55E'
                            : member.status === 'work'
                            ? '#F97316'
                            : '#3B82F6'
                        }
                      />
                      <Text
                        className={`text-xs font-medium ml-1 ${
                          member.status === 'home'
                            ? 'text-green-700'
                            : member.status === 'work'
                            ? 'text-orange-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {member.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Row 3: Small Widgets - Stats + Quick Actions */}
          <View className="flex-row gap-4">
            {/* Small Widget: Points */}
            <View className="flex-1">
              <View className="bg-white rounded-3xl shadow-sm p-4">
                <View className="bg-purple-100 rounded-2xl px-3 py-1 mb-3 self-start">
                  <Text className="text-purple-900 font-semibold text-xs">
                    Points
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-purple-600 mb-1">
                  {userProfile?.points || 0}
                </Text>
                <Text className="text-gray-500 text-xs">This week</Text>
              </View>
            </View>

            {/* Small Widget: Streak */}
            <View className="flex-1">
              <View className="bg-white rounded-3xl shadow-sm p-4">
                <View className="bg-orange-100 rounded-2xl px-3 py-1 mb-3 self-start">
                  <Text className="text-orange-900 font-semibold text-xs">
                    Streak
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-orange-600 mb-1">
                  7🔥
                </Text>
                <Text className="text-gray-500 text-xs">Days active</Text>
              </View>
            </View>
          </View>

          {/* Row 4: Calendar + Quick Add Buttons */}
          <View className="flex-row gap-4 mt-4">
            {/* Calendar Button */}
            <View className="flex-1">
              <TouchableOpacity
                className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl shadow-sm p-4 items-center justify-center"
                style={{ minHeight: 100 }}
                onPress={() => navigation.navigate('Calendar')}
                activeOpacity={0.7}
              >
                <Calendar size={32} color="white" strokeWidth={2.5} />
                <Text className="text-white font-semibold text-sm mt-2">
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rewards Button - Temporarily disabled until added to navigation */}
            {/* <View className="flex-1">
              <TouchableOpacity
                className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-sm p-4 items-center justify-center"
                style={{ minHeight: 100 }}
                onPress={() => navigation.navigate('Rewards')}
                activeOpacity={0.7}
              >
                <Gift size={32} color="white" strokeWidth={2.5} />
                <Text className="text-white font-semibold text-sm mt-2">
                  Rewards
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingContainer: { flex: 1 },
  greetingText: { fontSize: 28, fontWeight: 'bold', color: '#581C87' },
  greetingName: { fontSize: 28, fontWeight: 'bold', color: '#581C87' },
  familySubtext: { fontSize: 14, color: '#7C3AED', marginTop: 4 },
  avatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  bentoGrid: { paddingHorizontal: 24, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  bigWidget: { flex: 1, minHeight: 280 },
  tallWidget: { width: 128, minHeight: 280 },
  wideWidget: { marginBottom: 16 },
  smallWidget: { flex: 1 },
  widgetCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, height: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  widgetHeader: { backgroundColor: '#E9D5FF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 16 },
  widgetHeaderText: { color: '#581C87', fontWeight: '600', fontSize: 14 },
  widgetContent: { flex: 1 },
  taskInfo: { marginBottom: 16 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  urgentLabel: { color: '#6B7280', fontSize: 12, marginLeft: 8 },
  badgeContainer: { backgroundColor: '#E9D5FF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText: { color: '#581C87', fontWeight: '600', fontSize: 14 },
  badgeContainerPink: { backgroundColor: '#FCE7F3', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  badgeTextPink: { color: '#831843', fontWeight: '600', fontSize: 12, textAlign: 'center' },
  badgeContainerBlue: { backgroundColor: '#DBEAFE', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 16 },
  badgeTextBlue: { color: '#1E3A8A', fontWeight: '600', fontSize: 14 },
  badgeContainerPurple: { backgroundColor: '#E9D5FF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  badgeTextPurple: { color: '#581C87', fontWeight: '600', fontSize: 12 },
  badgeContainerOrange: { backgroundColor: '#FFEDD5', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  badgeTextOrange: { color: '#7C2D12', fontWeight: '600', fontSize: 12 },
  taskContent: { flex: 1 },
  taskInfoContainer: { marginBottom: 16 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metaLabel: { color: '#6B7280', fontSize: 12, marginLeft: 8 },
  taskTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  taskAssignee: { color: '#4B5563', fontSize: 14 },
  progressSection: { marginTop: 'auto' },
  progressContainer: { marginTop: 'auto' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#6B7280', fontSize: 14 },
  progressCount: { color: '#7C3AED', fontWeight: '600', fontSize: 14 },
  progressBar: { height: 8, backgroundColor: '#E9D5FF', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#9CA3AF', marginTop: 16, textAlign: 'center', fontSize: 14 },
  shoppingContent: { flex: 1 },
  shoppingItem: { marginBottom: 12 },
  shoppingItemChecked: { opacity: 0.5 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#F9A8D4', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#EC4899', borderColor: '#EC4899' },
  checkmark: { color: 'white', fontSize: 12 },
  shoppingItemText: { fontSize: 12, marginTop: 4, color: '#374151' },
  shoppingItemTextChecked: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  shoppingIcon: { alignItems: 'center', marginTop: 8 },
  familyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  familyMember: { alignItems: 'center', flex: 1 },
  familyAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  familyAvatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  familyName: { color: '#111827', fontWeight: '600', fontSize: 14, marginBottom: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500', marginLeft: 4 },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#7C3AED', marginBottom: 4 },
  statValueOrange: { fontSize: 32, fontWeight: 'bold', color: '#EA580C', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  actionButton: { backgroundColor: '#0EA5E9', borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionButtonOrange: { backgroundColor: '#F59E0B', borderRadius: 24, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionButtonText: { color: 'white', fontWeight: '600', fontSize: 14, marginTop: 8 },
});
