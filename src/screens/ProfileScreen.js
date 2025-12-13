import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('trips');

  const profile = {
    name: 'Sarah Chen',
    username: '@sarahexplores',
    bio: 'Travel enthusiast 🌍 | Adventure seeker ⛰️ | Food lover 🍜',
    stats: {
      trips: 24,
      likes: 15600,
      bookmarks: 89,
    },
  };

  const tabs = [
    { id: 'trips', label: 'My Trips', icon: 'map' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
    { id: 'drafts', label: 'Drafts', icon: 'document' },
  ];

  const myTrips = [
    { id: 1, location: 'Pokhara', cost: 12500, days: 3, likes: 1240 },
    { id: 2, location: 'Kathmandu', cost: 25000, days: 5, likes: 890 },
    { id: 3, location: 'Chitwan', cost: 8500, days: 2, likes: 567 },
  ];

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tripItem, { backgroundColor: colors.card }, shadows.sm]}
      onPress={() => navigation.navigate('PostDetails', { tripId: item.id })}
    >
      <View style={[styles.tripThumb, { backgroundColor: colors.backgroundAlt }]}>
        <Ionicons name="image" size={32} color={colors.textLight} />
      </View>
      <View style={styles.tripInfo}>
        <Text style={[styles.tripLocation, { color: colors.text }]}>{item.location}</Text>
        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={12} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.days} days
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash" size={12} color={colors.accent} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              NPR {item.cost.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.likesContainer}>
        <Ionicons name="heart" size={16} color="#FF4757" />
        <Text style={[styles.likesCount, { color: colors.text }]}>{item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.username, { color: colors.text }]}>{profile.username}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
          </LinearGradient>

          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>

          {/* Stats */}
          <View style={[styles.statsContainer, { backgroundColor: colors.card }, shadows.sm]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats.trips}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trips</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {(profile.stats.likes / 1000).toFixed(1)}K
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profile.stats.bookmarks}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.editButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.editGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={styles.editText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.card }]}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.primary : colors.textLight}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.id ? colors.primary : colors.textLight,
                    fontWeight:
                      activeTab === tab.id ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'trips' && (
            <FlatList
              data={myTrips}
              renderItem={renderTripItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}

          {activeTab === 'saved' && (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Trips</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Start saving trips you love
              </Text>
            </View>
          )}

          {activeTab === 'drafts' && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={colors.textLight} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Drafts</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Your draft trips will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  headerLeft: {},
  username: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  editButton: {
    flex: 1,
  },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
  },
  content: {
    padding: SPACING.lg,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  tripThumb: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tripLocation: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
  },
});

export default ProfileScreen;
