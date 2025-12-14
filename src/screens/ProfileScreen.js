import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserPosts } from '../services/postService';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SPACING = 2;
const ITEM_SIZE = (width - (COLUMN_COUNT + 1) * ITEM_SPACING) / COLUMN_COUNT;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const { user, token, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('trips');
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch user posts
  const fetchUserPosts = async (pageNum = 1, isRefresh = false) => {
    // Support both 'id' and '_id' for user identifier
    const userId = user?.id || user?._id;
    
    if (!userId || !token) {
      console.log('⚠️ Cannot fetch posts - missing user ID or token');
      return;
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoadingPosts(true);
      }

      console.log('📥 Fetching posts for user:', userId, 'Page:', pageNum);
      const response = await getUserPosts(userId, pageNum, 20);
      
      console.log('✅ Posts response:', response);
      
      if (response && response.data) {
        console.log('📦 Posts data length:', response.data.length);
        if (isRefresh) {
          setUserPosts(response.data);
        } else {
          setUserPosts(prev => pageNum === 1 ? response.data : [...prev, ...response.data]);
        }
        setHasMore(response.data.length === 20);
        setPage(pageNum);
      } else {
        console.log('⚠️ No data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      console.error('❌ Error details:', error.message);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  // Load posts on mount and when user changes
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (isAuthenticated && userId && token) {
      fetchUserPosts(1);
    }
  }, [user?.id, user?._id, token, isAuthenticated]);

  // Refresh posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    React.useCallback(() => {
      const userId = user?.id || user?._id;
      if (isAuthenticated && userId && token) {
        console.log('🔄 ProfileScreen focused - refreshing posts');
        fetchUserPosts(1, true);
      }
    }, [user?.id, user?._id, token, isAuthenticated])
  );

  // Refresh handler
  const onRefresh = () => {
    fetchUserPosts(1, true);
  };

  // Static data for tabs
  const tabs = [
    { id: 'trips', label: 'My Trips', icon: 'map' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
    { id: 'drafts', label: 'Drafts', icon: 'document' },
  ];

  // Render TikTok-style grid item with unique design
  const renderGridItem = ({ item, index }) => {
    const isVideo = item.media?.type === 'video';
    // Use thumbnail for videos (first frame), regular URL for images
    const mediaUrl = isVideo && item.media?.thumbnail ? item.media.thumbnail : item.media?.url;
    
    return (
      <Pressable
        key={item._id}
        style={styles.gridItem}
        onPress={() => navigation.navigate('PostDetails', { postId: item._id })}
      >
        {/* Media Thumbnail */}
        <Image 
          source={{ uri: mediaUrl }} 
          style={styles.gridItemImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gridItemGradient}
        />

        {/* Video Indicator */}
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Trip Type Badge */}
        {item.tripDetails?.tripType && (
          <View style={[
            styles.tripTypeBadge,
            { backgroundColor: item.tripDetails.tripType === 'short' ? 'rgba(38, 121, 255, 0.9)' : 'rgba(255, 59, 48, 0.9)' }
          ]}>
            <Text style={styles.tripTypeBadgeText}>
              {item.tripDetails.tripType === 'short' ? 'Short' : 'Long'}
            </Text>
          </View>
        )}

        {/* Location Pin */}
        {item.location?.name && (
          <View style={styles.gridItemLocation}>
            <Ionicons name="location" size={12} color="#FFFFFF" />
            <Text style={styles.gridItemLocationText} numberOfLines={1}>
              {item.location.name}
            </Text>
          </View>
        )}

        {/* Stats Overlay */}
        <View style={styles.gridItemStats}>
          {/* Views/Likes */}
          <View style={styles.gridItemStat}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
            <Text style={styles.gridItemStatText}>
              {item.likes?.length || 0}
            </Text>
          </View>
          
          {/* Days Duration */}
          {item.tripDetails?.days && (
            <View style={styles.gridItemStat}>
              <Ionicons name="calendar" size={14} color="#FFFFFF" />
              <Text style={styles.gridItemStatText}>
                {item.tripDetails.days}d
              </Text>
            </View>
          )}
        </View>

        {/* Shimmer effect on long press */}
        <View style={styles.shimmerOverlay} pointerEvents="none" />
      </Pressable>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  // Not authenticated - show login/signup
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.authContainer}>
          {/* Icon */}
          <View style={[styles.authIcon, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="person-outline" size={64} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Join TripMate
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
            Sign in to create your profile, share trips, and connect with travelers
          </Text>

          {/* Features */}
          <View style={styles.authFeatures}>
            {[
              { icon: 'map', text: 'Share your travel stories' },
              { icon: 'bookmark', text: 'Save favorite destinations' },
              { icon: 'people', text: 'Connect with travelers' },
            ].map((feature, idx) => (
              <View key={idx} style={styles.authFeature}>
                <View style={[styles.authFeatureIcon, { backgroundColor: colors.card }]}>
                  <Ionicons name={feature.icon} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.authFeatureText, { color: colors.text }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={[styles.authPrimaryButton]}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary]}
                style={styles.gradientButton}
              >
                <Text style={styles.authPrimaryButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authSecondaryButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.authSecondaryButtonText, { color: colors.text }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Authenticated - show profile
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Cover Image & Header */}
        <View style={styles.coverContainer}>
          <Image 
            source={{ 
              uri: user?.coverImage || 'https://images.pexels.com/photos/31410276/pexels-photo-31410276.jpeg' 
            }} 
            style={styles.coverImage} 
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
          
          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <View style={{ width: 40 }} />
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
              <Image 
                source={{ uri: user?.avatar || 'https://i.pravatar.cc/150' }} 
                style={styles.avatar} 
              />
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
          {user?.bio ? (
            <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text>
          ) : null}
          {user?.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {user.location}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
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
                {userPosts.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Trips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {user?.stats?.followers || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {user?.stats?.following || 0}
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
            <>
              {loadingPosts && userPosts.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading trips...
                  </Text>
                </View>
              ) : userPosts.length > 0 ? (
                <View style={styles.gridContainer}>
                  {userPosts.map((item, index) => renderGridItem({ item, index }))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.primaryAlpha }]}>
                    <Ionicons name="camera-outline" size={48} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Trips Yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Start sharing your travel adventures
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('PlannerTab')}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyButtonText}>Create First Trip</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
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
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
  },
  // Auth (Not Logged In) State
  authContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
    justifyContent: 'center',
  },
  authIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  authTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  authSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
  },
  authFeatures: {
    gap: SPACING.lg,
    marginBottom: SPACING.xxxl,
  },
  authFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  authFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authFeatureText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  authButtons: {
    gap: SPACING.md,
  },
  authPrimaryButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  authPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  authSecondaryButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  authSecondaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
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
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  locationText: {
    fontSize: FONT_SIZES.sm,
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
    paddingTop: SPACING.xs,
  },
  // TikTok-Style Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ITEM_SPACING,
    padding: ITEM_SPACING,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.4, // Taller aspect ratio like TikTok
    position: 'relative',
    overflow: 'hidden',
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
  },
  gridItemGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  videoIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripTypeBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tripTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
  },
  gridItemLocation: {
    position: 'absolute',
    bottom: SPACING.sm + 24,
    left: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gridItemLocationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.semibold,
    flex: 1,
  },
  gridItemStats: {
    position: 'absolute',
    bottom: SPACING.xs,
    left: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridItemStatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FONT_WEIGHTS.bold,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  // Old trip card styles - kept for reference
  tripsGrid: {
    gap: SPACING.md,
  },
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
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default ProfileScreen;
