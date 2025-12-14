import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { getPostById } from '../services/postService';

const { width, height } = Dimensions.get('window');

const PostDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  // Handle both postId and tripId for backward compatibility
  const { postId, tripId } = route.params || {};
  const id = postId || tripId;
  
  const [activeTab, setActiveTab] = useState('vlog');
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);

  // Fetch post data on mount
  useEffect(() => {
    if (id) {
      fetchPostData();
    } else {
      setError('No post ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📄 Fetching post details for:', id);
      
      const data = await getPostById(id);
      console.log('✅ Post loaded successfully:');
      console.log('   - Title:', data.title);
      console.log('   - Media type:', data.media?.type);
      console.log('   - Media URL:', data.media?.url);
      console.log('   - Location:', data.location?.name);
      console.log('   - User:', data.user?.fullName);
      console.log('   - Budget:', data.tripDetails?.budget?.amount);
      console.log('   - Vlogs count:', data.vlogs?.length || 0);
      console.log('   - Full post data:', JSON.stringify(data, null, 2));
      
      setPost(data);
      setIsSaved(data.saved || false);
      setIsLiked(data.liked || false);
    } catch (err) {
      console.error('❌ Error loading post:', err);
      setError(err.message || 'Failed to load post');
      Alert.alert('Error', 'Failed to load post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'vlog', label: 'Vlog', icon: 'play-circle' },
    { id: 'itinerary', label: 'Itinerary', icon: 'map' },
    { id: 'budget', label: 'Budget', icon: 'wallet' },
  ];

  const handleSave = () => {
    Animated.sequence([
      Animated.spring(saveAnim, {
        toValue: 0.8,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(saveAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    setIsSaved(!isSaved);
  };

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(likeAnim, {
        toValue: 0.8,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    setIsLiked(!isLiked);
  };

  // Parallax effect for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Simple Header - Always Visible */}
      <View style={[styles.header, { backgroundColor: colors.card }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Trip Details
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? colors.primary : colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading post details...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchPostData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content - Only show when post is loaded */}
      {!loading && !error && post && (
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image/Video Section */}
        <View style={styles.imageContainer}>
          {post.media?.type === 'video' ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: post.media.url }}
                style={styles.mainImage}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true}
                isLooping={true}
                isMuted={!soundOn}
                onLoad={() => setVideoReady(true)}
                onError={(error) => {
                  console.error('Video error:', error);
                  setVideoReady(false);
                }}
              />
              
              {/* Loading indicator while video loads */}
              {!videoReady && (
                <View style={styles.videoLoadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}
              
              {/* Sound toggle button */}
              {videoReady && (
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() => setSoundOn(!soundOn)}
                >
                  <Ionicons 
                    name={soundOn ? 'volume-high' : 'volume-mute'} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Image
              source={{ uri: post.media?.url || post.media?.thumbnail }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title & Location */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {post.location?.name || post.location?.address || 'Unknown Location'}
              </Text>
            </View>
            {post.description && (
              <Text style={[styles.description, { color: colors.textSecondary, marginTop: 12 }]}>
                {post.description}
              </Text>
            )}
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card }, shadows.sm]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {post.tripDetails?.duration || 0} Days
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }, shadows.sm]}>
              <Ionicons name="wallet-outline" size={20} color={colors.accent} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Cost</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {post.tripDetails?.budget?.currency || 'NPR'} {((post.tripDetails?.budget?.amount || 0) / 1000).toFixed(1)}k
              </Text>
            </View>
          </View>

          {/* Interests Tags */}
          {post.tripDetails?.interests && post.tripDetails.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {post.tripDetails.interests.map((interest, idx) => (
                <View key={idx} style={[styles.interestTag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.interestText, { color: colors.primary }]}>
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Author Info */}
          <TouchableOpacity style={[styles.authorSection, { backgroundColor: colors.card }, shadows.sm]}>
            <Image 
              source={{ uri: post.user?.avatar || 'https://i.pravatar.cc/150?img=1' }} 
              style={styles.avatar} 
            />
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {post.user?.fullName || 'Unknown User'}
                </Text>
                {post.user?.verified && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.authorBio, { color: colors.textSecondary }]}>
                {post.user?.bio || `Travel enthusiast 🌍`}
              </Text>
            </View>
            <TouchableOpacity style={[styles.followBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={handleLike}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? "#FF3B30" : colors.text} 
              />
              <Text style={[styles.statText, { color: colors.text }]}>
                {isLiked ? (post.stats?.likes || 0) + 1 : (post.stats?.likes || 0)}
              </Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>{post.stats?.comments || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={22} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {((post.stats?.views || 0) / 1000).toFixed(1)}k
              </Text>
            </View>
            <TouchableOpacity style={styles.statItem}>
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Simple Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && [styles.activeTab, { borderBottomColor: colors.primary }],
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
                    styles.tabLabel,
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

          {/* Tab Content */}
          {activeTab === 'vlog' && (
            <View style={styles.tabContent}>
              {/* Vlog Grid */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Vlogs ({post.vlogs?.length || 0})
                </Text>
                {post.vlogs && post.vlogs.length > 0 ? (
                  <View style={styles.vlogGrid}>
                    {post.vlogs.map((vlog, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.vlogCard, { backgroundColor: colors.card }, shadows.sm]}
                        activeOpacity={0.8}
                      >
                        {/* Thumbnail */}
                        <View style={styles.vlogThumbnail}>
                          <Image source={{ uri: vlog.thumbnail || vlog.uri }} style={styles.vlogImage} />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.vlogGradient}
                          />
                          {/* Play Icon */}
                          <View style={styles.playIconContainer}>
                            <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                          </View>
                          {/* Duration Badge */}
                          {vlog.duration && (
                            <View style={styles.durationBadge}>
                              <Text style={styles.durationText}>
                                {Math.floor(vlog.duration / 60)}:{(vlog.duration % 60).toString().padStart(2, '0')}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Vlog Info */}
                        <View style={styles.vlogInfo}>
                          <Text style={[styles.vlogTitle, { color: colors.text }]} numberOfLines={2}>
                            {vlog.title || `Vlog ${index + 1}`}
                          </Text>
                          <View style={styles.vlogStats}>
                            <Ionicons name="videocam-outline" size={14} color={colors.textSecondary} />
                            <Text style={[styles.vlogViews, { color: colors.textSecondary }]}>
                              {vlog.duration ? `${Math.floor(vlog.duration / 60)}:${(vlog.duration % 60).toString().padStart(2, '0')}` : 'Video'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyVlog}>
                    <Ionicons name="videocam-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyVlogText, { color: colors.textSecondary }]}>
                      No vlogs available for this trip.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'itinerary' && (
            <View style={styles.tabContent}>
              {post.tripDetails?.itinerary && post.tripDetails.itinerary.length > 0 ? (
                post.tripDetails.itinerary.map((day, idx) => (
                  <View key={idx} style={styles.dayContainer}>
                    {/* Day Header */}
                    <View style={[styles.dayHeader, { backgroundColor: colors.card }, shadows.sm]}>
                      <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                      </View>
                      <Text style={[styles.dayTitle, { color: colors.text }]}>
                        {day.title || `Day ${day.day} Activities`}
                      </Text>
                    </View>

                    {/* Activities */}
                    <View style={[styles.activityItem, { backgroundColor: colors.card }, shadows.sm]}>
                      <Text style={[styles.activityName, { color: colors.text }]}>
                        {day.activities || 'No activities listed'}
                      </Text>
                      {day.budget > 0 && (
                        <View style={styles.locationRow}>
                          <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.activityLocation, { color: colors.textSecondary }]}>
                            Budget: NPR {day.budget.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyVlog}>
                  <Ionicons name="map-outline" size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyVlogText, { color: colors.textSecondary }]}>
                    No itinerary available for this trip.
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'budget' && (
            <View style={styles.tabContent}>
              {post.tripDetails?.budget ? (
                <>
                  {/* Total Cost */}
                  <View style={[styles.totalCostContainer, { backgroundColor: colors.primary }]}>
                    <Text style={styles.totalLabel}>Total Cost</Text>
                    <Text style={styles.totalAmount}>
                      {post.tripDetails.budget.currency || 'NPR'} {(post.tripDetails.budget.amount || 0).toLocaleString()}
                    </Text>
                    <Text style={styles.perPersonText}>
                      Estimated budget for your trip
                    </Text>
                  </View>

                  {/* Budget Items - Only show if breakdown exists */}
                  {post.tripDetails.budget.breakdown && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Breakdown</Text>
                      {[
                        { 
                          label: 'Accommodation', 
                          amount: post.tripDetails.budget.breakdown.accommodation || 0, 
                          icon: 'bed-outline', 
                          color: '#2679FF' 
                        },
                        { 
                          label: 'Food', 
                          amount: post.tripDetails.budget.breakdown.food || 0, 
                          icon: 'restaurant-outline', 
                          color: '#00C896' 
                        },
                        { 
                          label: 'Transport', 
                          amount: post.tripDetails.budget.breakdown.transport || 0, 
                          icon: 'car-outline', 
                          color: '#FF9500' 
                        },
                        { 
                          label: 'Activities', 
                          amount: post.tripDetails.budget.breakdown.activities || 0, 
                          icon: 'bicycle-outline', 
                          color: '#FF3B30' 
                        },
                      ].filter(item => item.amount > 0).map((item, idx) => {
                        const total = post.tripDetails.budget.amount || 1;
                        return (
                          <View 
                            key={idx} 
                            style={[styles.budgetItem, { backgroundColor: colors.card }, shadows.sm]}
                          >
                            <View style={[styles.budgetIcon, { backgroundColor: item.color + '20' }]}>
                              <Ionicons name={item.icon} size={22} color={item.color} />
                            </View>
                            <View style={styles.budgetDetails}>
                              <Text style={[styles.budgetLabel, { color: colors.text }]}>{item.label}</Text>
                              <Text style={[styles.budgetAmount, { color: colors.textSecondary }]}>
                                {((item.amount / total) * 100).toFixed(0)}% of total
                              </Text>
                            </View>
                            <Text style={[styles.budgetValue, { color: colors.text }]}>
                              {post.tripDetails.budget.currency || 'NPR'} {item.amount.toLocaleString()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Tips */}
                  <View style={[styles.tipsContainer, { backgroundColor: colors.backgroundAlt }]}>
                    <View style={styles.tipsHeader}>
                      <Ionicons name="bulb-outline" size={20} color={colors.primary} />
                      <Text style={[styles.tipsTitle, { color: colors.text }]}>Money Saving Tips</Text>
                    </View>
                    <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                      • Book accommodation 2 weeks in advance{'\n'}
                      • Eat at local restaurants{'\n'}
                      • Use shared transport{'\n'}
                      • Look for group discounts
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.emptyVlog}>
                  <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyVlogText, { color: colors.textSecondary }]}>
                    No budget information available for this trip.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Loading & Error States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Simple Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
  },
  // Image
  imageContainer: {
    width: width,
    height: width * 0.75,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  // Content
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  // Title Section
  titleSection: {
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: FONT_SIZES.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  // Interests
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  interestTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  interestText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  // Quick Info
  quickInfoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
  },
  infoValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  // Author
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  authorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  authorBio: {
    fontSize: FONT_SIZES.xs,
  },
  followBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: SPACING.lg,
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
  activeTab: {
    // borderBottomColor set inline
  },
  tabLabel: {
    fontSize: FONT_SIZES.sm,
  },
  // Tab Content
  tabContent: {
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  // Gallery
  gallery: {
    gap: SPACING.sm,
  },
  galleryImage: {
    width: width * 0.65,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  // Include Items
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  includeText: {
    fontSize: FONT_SIZES.md,
  },
  // Itinerary
  dayContainer: {
    marginBottom: SPACING.xl,
  },
  dayHeader: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  dayBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  dayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  activityItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
  },
  activityName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  activityLocation: {
    fontSize: FONT_SIZES.sm,
  },
  // Budget
  totalCostContainer: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  perPersonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  budgetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetDetails: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  budgetAmount: {
    fontSize: FONT_SIZES.xs,
  },
  budgetValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  // Tips
  tipsContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  tipsText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  // Vlog Section
  addVlogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  addVlogText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  vlogGrid: {
    gap: SPACING.md,
  },
  vlogCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  vlogThumbnail: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  vlogImage: {
    width: '100%',
    height: '100%',
  },
  vlogGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  vlogInfo: {
    padding: SPACING.md,
  },
  vlogTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  vlogStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vlogViews: {
    fontSize: FONT_SIZES.xs,
  },
  emptyVlog: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyVlogText: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  videoLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButton: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default PostDetailsScreen;
