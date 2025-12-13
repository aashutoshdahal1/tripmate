import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();

  const notifications = [
    {
      id: 1,
      type: 'like',
      icon: 'heart',
      iconColor: '#FF4757',
      title: 'New Like',
      message: 'John liked your trip to Pokhara',
      time: '2 min ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      icon: 'chatbubble',
      iconColor: colors.primary,
      title: 'New Comment',
      message: 'Emma commented on your Kathmandu trip',
      time: '15 min ago',
      read: false,
    },
    {
      id: 3,
      type: 'ai',
      icon: 'sparkles',
      iconColor: colors.accent,
      title: 'AI Suggestion',
      message: 'Check out these trending destinations based on your interests',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 4,
      type: 'follow',
      icon: 'person-add',
      iconColor: colors.primary,
      title: 'New Follower',
      message: 'David started following you',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'bookmark',
      icon: 'bookmark',
      iconColor: colors.accent,
      title: 'Trip Saved',
      message: 'Someone saved your Chitwan trip',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 6,
      type: 'ai',
      icon: 'sparkles',
      iconColor: colors.accent,
      title: 'Budget Alert',
      message: 'Great deals to Pokhara this weekend!',
      time: '1 day ago',
      read: true,
    },
  ];

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.read ? colors.card : colors.primaryAlpha,
        },
        shadows.sm,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}20` }]}>
        <Ionicons name={item.icon} size={24} color={item.iconColor} />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textLight }]}>
          {item.time}
        </Text>
      </View>

      <TouchableOpacity style={styles.dismissButton}>
        <Ionicons name="close" size={20} color={colors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCount, { color: colors.primary }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.markAllButton}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
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
          <Ionicons name="notifications-off-outline" size={80} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You're all caught up!
          </Text>
        </View>
      )}
    </SafeAreaView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  unreadCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  markAllButton: {
    padding: SPACING.sm,
  },
  markAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  listContent: {
    padding: SPACING.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginRight: SPACING.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
  },
  dismissButton: {
    padding: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
