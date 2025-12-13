import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const PostDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const [activeTab, setActiveTab] = useState('vlog');
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;

  const trip = {
    id: 1,
    title: 'Hidden Paradise in the Mountains',
    location: 'Pokhara',
    country: 'Nepal',
    days: 3,
    cost: 12500,
    currency: 'NPR',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Travel enthusiast 🌍 | 47 trips shared',
      verified: true,
    },
    likes: 1240,
    comments: 89,
    views: 12400,
    saved: false,
    images: [
      'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
      'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
      'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
    ],
    vlogs: [
      {
        id: 1,
        thumbnail: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
        title: 'Sunrise at Sarangkot',
        duration: '5:23',
        views: 12400,
      },
      {
        id: 2,
        thumbnail: 'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
        title: 'Paragliding Adventure',
        duration: '8:45',
        views: 8900,
      },
      {
        id: 3,
        thumbnail: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
        title: 'Peace Pagoda Hike',
        duration: '6:12',
        views: 6700,
      },
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Lakeside Exploration',
        activities: [
          { time: '06:00 AM', activity: 'Sunrise at Sarangkot', location: 'Sarangkot' },
          { time: '09:00 AM', activity: 'Breakfast at German Bakery', location: 'Lakeside' },
          { time: '11:00 AM', activity: 'Paragliding Adventure', location: 'Sarangkot' },
          { time: '02:00 PM', activity: 'Lunch & Rest', location: 'Hotel' },
          { time: '05:00 PM', activity: 'Sunset Boat Ride', location: 'Phewa Lake' },
          { time: '07:00 PM', activity: 'Dinner at Local Restaurant', location: 'Lakeside' },
        ],
      },
      {
        day: 2,
        title: 'Adventure & Nature',
        activities: [
          { time: '07:00 AM', activity: 'World Peace Pagoda Hike', location: 'Peace Pagoda' },
          { time: '12:00 PM', activity: 'Lunch with Lake View', location: 'Lakeside' },
          { time: '03:00 PM', activity: 'Davis Falls & Cave Visit', location: 'Davis Falls' },
          { time: '06:00 PM', activity: 'Shopping at Lakeside', location: 'Lakeside' },
          { time: '08:00 PM', activity: 'Traditional Nepali Dinner', location: 'Local Restaurant' },
        ],
      },
      {
        day: 3,
        title: 'Departure',
        activities: [
          { time: '08:00 AM', activity: 'Breakfast & Check-out', location: 'Hotel' },
          { time: '10:00 AM', activity: 'Last Minute Shopping', location: 'Lakeside' },
          { time: '12:00 PM', activity: 'Departure', location: 'Pokhara' },
        ],
      },
    ],
    budget: {
      accommodation: 4500,
      food: 3500,
      transport: 2000,
      activities: 2500,
      total: 12500,
      perPerson: 12500,
      groupSize: 1,
    },
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Simple Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: trip.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title & Location */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>{trip.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {trip.location}, {trip.country}
              </Text>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card }, shadows.sm]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{trip.days} Days</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }, shadows.sm]}>
              <Ionicons name="wallet-outline" size={20} color={colors.accent} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Cost</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {trip.currency} {(trip.cost / 1000).toFixed(1)}k
              </Text>
            </View>
          </View>

          {/* Author Info */}
          <TouchableOpacity style={[styles.authorSection, { backgroundColor: colors.card }, shadows.sm]}>
            <Image source={{ uri: trip.author.avatar }} style={styles.avatar} />
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorName, { color: colors.text }]}>{trip.author.name}</Text>
                {trip.author.verified && (
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                )}
              </View>
              <Text style={[styles.authorBio, { color: colors.textSecondary }]}>
                {trip.author.bio}
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
                {isLiked ? trip.likes + 1 : trip.likes}
              </Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>{trip.comments}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={22} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {(trip.views / 1000).toFixed(1)}k
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
                  Vlogs ({trip.vlogs.length})
                </Text>
                {trip.vlogs.length > 0 ? (
                  <View style={styles.vlogGrid}>
                    {trip.vlogs.map((vlog) => (
                      <TouchableOpacity
                        key={vlog.id}
                        style={[styles.vlogCard, { backgroundColor: colors.card }, shadows.sm]}
                        activeOpacity={0.8}
                      >
                        {/* Thumbnail */}
                        <View style={styles.vlogThumbnail}>
                          <Image source={{ uri: vlog.thumbnail }} style={styles.vlogImage} />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.vlogGradient}
                          />
                          {/* Play Icon */}
                          <View style={styles.playIconContainer}>
                            <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                          </View>
                          {/* Duration Badge */}
                          <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>{vlog.duration}</Text>
                          </View>
                        </View>

                        {/* Vlog Info */}
                        <View style={styles.vlogInfo}>
                          <Text style={[styles.vlogTitle, { color: colors.text }]} numberOfLines={2}>
                            {vlog.title}
                          </Text>
                          <View style={styles.vlogStats}>
                            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                            <Text style={[styles.vlogViews, { color: colors.textSecondary }]}>
                              {(vlog.views / 1000).toFixed(1)}k views
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
                      No vlogs yet. Be the first to share!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'itinerary' && (
            <View style={styles.tabContent}>
              {trip.itinerary.map((day, idx) => (
                <View key={idx} style={styles.dayContainer}>
                  {/* Day Header */}
                  <View style={[styles.dayHeader, { backgroundColor: colors.card }, shadows.sm]}>
                    <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                    </View>
                    <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
                  </View>

                  {/* Activities */}
                  {day.activities.map((activity, aIdx) => (
                    <View 
                      key={aIdx} 
                      style={[styles.activityItem, { backgroundColor: colors.card }, shadows.sm]}
                    >
                      <View style={[styles.timeBadge, { backgroundColor: colors.backgroundAlt }]}>
                        <Ionicons name="time-outline" size={14} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                          {activity.time}
                        </Text>
                      </View>
                      <Text style={[styles.activityName, { color: colors.text }]}>
                        {activity.activity}
                      </Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.activityLocation, { color: colors.textSecondary }]}>
                          {activity.location}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'budget' && (
            <View style={styles.tabContent}>
              {/* Total Cost */}
              <View style={[styles.totalCostContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalAmount}>
                  {trip.currency} {trip.budget.total.toLocaleString()}
                </Text>
                <Text style={styles.perPersonText}>
                  {trip.currency} {trip.budget.perPerson.toLocaleString()} per person
                </Text>
              </View>

              {/* Budget Items */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Breakdown</Text>
                {[
                  { label: 'Accommodation', amount: trip.budget.accommodation, icon: 'bed-outline', color: '#2679FF' },
                  { label: 'Food', amount: trip.budget.food, icon: 'restaurant-outline', color: '#00C896' },
                  { label: 'Transport', amount: trip.budget.transport, icon: 'car-outline', color: '#FF9500' },
                  { label: 'Activities', amount: trip.budget.activities, icon: 'bicycle-outline', color: '#FF3B30' },
                ].map((item, idx) => (
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
                        {((item.amount / trip.budget.total) * 100).toFixed(0)}% of total
                      </Text>
                    </View>
                    <Text style={[styles.budgetValue, { color: colors.text }]}>
                      {trip.currency} {item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

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
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default PostDetailsScreen;
