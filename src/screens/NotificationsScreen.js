import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'likes', label: 'Likes' },
    { id: 'comments', label: 'Comments' },
  ];

  const notifications = [
    {
      id: 1,
      type: 'like',
      icon: 'heart',
      iconBg: '#FFE8E8',
      iconColor: '#FF3B30',
      avatar: 'https://i.pravatar.cc/150?img=10',
      title: 'John Miller',
      message: 'liked your trip to Pokhara',
      time: '2m ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      icon: 'chatbubble',
      iconBg: '#E8F5FF',
      iconColor: colors.primary,
      avatar: 'https://i.pravatar.cc/150?img=2',
      title: 'Emma Wilson',
      message: 'commented: "Amazing photos! How was the paragliding?"',
      time: '15m ago',
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      icon: 'person-add',
      iconBg: '#E8FFE8',
      iconColor: '#00C896',
      avatar: 'https://i.pravatar.cc/150?img=3',
      title: 'David Chen',
      message: 'started following you',
      time: '1h ago',
      read: false,
    },
    {
      id: 4,
      type: 'ai',
      icon: 'sparkles',
      iconBg: '#FFF3E8',
      iconColor: '#FF9500',
      title: 'AI Suggestion',
      message: 'Check out trending destinations based on your interests',
      time: '3h ago',
      read: true,
    },
    {
      id: 5,
      type: 'bookmark',
      icon: 'bookmark',
      iconBg: '#F8E8FF',
      iconColor: '#9747FF',
      avatar: 'https://i.pravatar.cc/150?img=4',
      title: 'Sarah Lopez',
      message: 'saved your Chitwan trip',
      time: '5h ago',
      read: true,
    },
    {
      id: 6,
      type: 'like',
      icon: 'heart',
      iconBg: '#FFE8E8',
      iconColor: '#FF3B30',
      avatar: 'https://i.pravatar.cc/150?img=5',
      title: 'Mike Johnson',
      message: 'liked your Kathmandu trip',
      time: '1d ago',
      read: true,
    },
  ];

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.read ? colors.card : colors.backgroundAlt,
        },
      ]}
      activeOpacity={0.7}
    >
      {/* Avatar or Icon */}
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.icon} size={20} color={item.iconColor} />
          </View>
        )}
        {!item.read && <View style={[styles.badge, { backgroundColor: colors.primary }]} />}
      </View>

      {/* Content */}
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: colors.text }]}>
          <Text style={{ fontWeight: FONT_WEIGHTS.semibold }}>{item.title}</Text>
          {' '}
          <Text style={{ color: colors.textSecondary }}>{item.message}</Text>
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
          {item.time}
        </Text>
      </View>

      {/* Action Icon */}
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }, shadows.sm]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.markAllButton}>
          <Ionicons name="checkmark-done" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                  fontWeight: activeTab === tab.id ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundAlt }]}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You're all caught up!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  markAllButton: {
    padding: SPACING.xs,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
  },
  listContent: {
    padding: SPACING.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  notificationText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
