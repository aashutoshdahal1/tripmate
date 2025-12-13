import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('trips');

  const profile = {
    name: 'Sarah Chen',
    username: '@sarahexplores',
    bio: 'Travel enthusiast 🌍 | Adventure seeker ⛰️ | Food lover 🍜',
    avatar: 'https://i.pravatar.cc/150?img=1',
    coverImage: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
    stats: {
      trips: 24,
      followers: 3420,
      following: 892,
    },
  };

  const tabs = [
    { id: 'trips', label: 'My Trips', icon: 'map' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
    { id: 'drafts', label: 'Drafts', icon: 'document' },
  ];

  const myTrips = [
    { 
      id: 1, 
      location: 'Pokhara, Nepal', 
      image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
      days: 3, 
      likes: 1240,
      date: 'Dec 2024',
    },
    { 
      id: 2, 
      location: 'Kathmandu, Nepal', 
      image: 'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
      days: 5, 
      likes: 890,
      date: 'Nov 2024',
    },
    { 
      id: 3, 
      location: 'Chitwan, Nepal', 
      image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
      days: 2, 
      likes: 567,
      date: 'Oct 2024',
    },
  ];

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.tripCard, shadows.sm]}
      onPress={() => navigation.navigate('PostDetails', { tripId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.tripImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.tripGradient}
      >
        <View style={styles.tripCardContent}>
          <Text style={styles.tripLocation} numberOfLines={1}>{item.location}</Text>
          <View style={styles.tripCardMeta}>
            <View style={styles.tripMetaItem}>
              <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
              <Text style={styles.tripMetaText}>{item.days} days</Text>
            </View>
            <View style={styles.tripMetaItem}>
              <Ionicons name="time-outline" size={14} color="#FFFFFF" />
              <Text style={styles.tripMetaText}>{item.date}</Text>
            </View>
          </View>
          <View style={styles.tripLikes}>
            <Ionicons name="heart" size={14} color="#FF3B30" />
            <Text style={styles.tripLikesText}>{item.likes}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image & Header */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: profile.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
          
          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerIconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar - Overlapping */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarWrapper, { borderColor: colors.background }]}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>{profile.username}</Text>
          <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.card }, shadows.sm]}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profile.stats.trips}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {(profile.stats.followers / 1000).toFixed(1)}k
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {profile.stats.following}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              />
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

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'trips' && (
            <View style={styles.tripsGrid}>
              {myTrips.map((item) => (
                <View key={item.id}>
                  {renderTripItem({ item })}
                </View>
              ))}
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Cover Section
  coverContainer: {
    position: 'relative',
  },
  coverImage: {
    width: width,
    height: 220,
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    left: SPACING.lg,
  },
  avatarWrapper: {
    borderWidth: 4,
    borderRadius: 60,
    padding: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  // Profile Info
  profileInfo: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 4,
  },
  username: {
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
  },
  // Content
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  tripsGrid: {
    gap: SPACING.md,
  },
  // Trip Card
  tripCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    height: 200,
  },
  tripImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tripGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tripCardContent: {
    padding: SPACING.md,
  },
  tripLocation: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  tripCardMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  tripMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripMetaText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
  },
  tripLikes: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tripLikesText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Empty State
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
