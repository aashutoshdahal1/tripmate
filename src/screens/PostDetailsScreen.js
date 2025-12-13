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
  const [activeTab, setActiveTab] = useState('itinerary');
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
    { id: 'overview', label: 'Overview', icon: 'information-circle' },
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
      {/* Floating Header - Animated on Scroll */}
      <Animated.View 
        style={[
          styles.floatingHeader,
          { 
            backgroundColor: colors.card,
            opacity: headerOpacity,
          },
          shadows.md
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {trip.title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Absolute Top Buttons (Over Image) */}
      <View style={styles.topButtons}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.iconButtonLarge, shadows.md]}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
            style={styles.iconGradient}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.topRightButtons}>
          <TouchableOpacity style={[styles.iconButtonLarge, shadows.md]}>
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
              style={styles.iconGradient}
            >
              <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Parallax */}
        <Animated.View 
          style={[
            styles.heroContainer,
            {
              transform: [
                { scale: imageScale },
                { translateY: imageTranslateY },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: trip.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
            locations={[0, 0.5, 1]}
          />
          
          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={16} color="#FFFFFF" />
                <Text style={styles.statItemText}>{(trip.views / 1000).toFixed(1)}k</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#FFFFFF" />
                <Text style={styles.statItemText}>{(trip.likes / 1000).toFixed(1)}k</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                <Text style={styles.statItemText}>{trip.comments}</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{trip.title}</Text>
            
            <View style={styles.heroLocation}>
              <Ionicons name="location" size={20} color="#00C896" />
              <Text style={styles.heroLocationText}>
                {trip.location}, {trip.country}
              </Text>
            </View>

            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Ionicons name="calendar-outline" size={14} color="#2679FF" />
                <Text style={styles.heroBadgeText}>{trip.days} Days</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="wallet-outline" size={14} color="#00C896" />
                <Text style={styles.heroBadgeText}>
                  {trip.currency} {(trip.cost / 1000).toFixed(1)}k
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Author Card - Floating Over Hero */}
        <View style={styles.authorCard}>
          <View style={[styles.authorCardInner, { backgroundColor: colors.card }, shadows.lg]}>
            <Image
              source={{ uri: trip.author.avatar }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {trip.author.name}
                </Text>
                {trip.author.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#2679FF" />
                )}
              </View>
              <Text style={[styles.authorBio, { color: colors.textSecondary }]}>
                {trip.author.bio}
              </Text>
            </View>
            <TouchableOpacity style={[styles.followButton, { backgroundColor: colors.primaryAlpha }]}>
              <Text style={[styles.followButtonText, { color: colors.primary }]}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons - Like, Save, Share */}
        <View style={styles.actionButtonsContainer}>
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isLiked ? '#FFE8E8' : colors.backgroundAlt },
                shadows.sm,
              ]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={24}
                color={isLiked ? '#FF3B30' : colors.text}
              />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {isLiked ? trip.likes + 1 : trip.likes}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: saveAnim }] }}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: isSaved ? '#E8F5FF' : colors.backgroundAlt },
                shadows.sm,
              ]}
              onPress={handleSave}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? '#2679FF' : colors.text}
              />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundAlt }, shadows.sm]}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {trip.comments}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs - Modern Segmented Control */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.backgroundAlt }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && [
                  styles.activeTab,
                  { backgroundColor: colors.card },
                  shadows.sm,
                ],
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.id ? colors.text : colors.textSecondary,
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
        <View style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.overviewTab}>
            {/* Image Gallery */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Gallery</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {trip.images.map((img, idx) => (
                  <View key={idx} style={[styles.galleryItem, shadows.md]}>
                    <Image source={{ uri: img }} style={styles.galleryImage} />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Highlights */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlights</Text>
              <View style={styles.highlightsGrid}>
                {[
                  { icon: 'airplane', label: 'Transport', value: 'Included' },
                  { icon: 'bed', label: 'Stay', value: '3★ Hotel' },
                  { icon: 'restaurant', label: 'Meals', value: 'Breakfast' },
                  { icon: 'people', label: 'Group', value: '2-8 People' },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={[styles.highlightCard, { backgroundColor: colors.card }, shadows.sm]}
                  >
                    <View style={[styles.highlightIcon, { backgroundColor: colors.primaryAlpha }]}>
                      <Ionicons name={item.icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.highlightValue, { color: colors.text }]}>
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About this trip</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Discover the breathtaking beauty of Pokhara, a serene lakeside city nestled in the
                Himalayas. Experience paragliding over Phewa Lake, hike to World Peace Pagoda, and
                witness stunning sunrises at Sarangkot. This 3-day adventure combines thrill,
                culture, and natural beauty in one unforgettable journey.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'itinerary' && (
          <View style={styles.itineraryTab}>
            {trip.itinerary.map((day, idx) => (
              <View key={idx} style={styles.daySection}>
                {/* Day Header - Modern Design */}
                <View style={styles.dayHeaderNew}>
                  <View style={styles.dayNumberContainer}>
                    <LinearGradient
                      colors={['#2679FF', '#00C896']}
                      style={styles.dayNumberGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.dayNumber}>{day.day}</Text>
                    </LinearGradient>
                    {idx < trip.itinerary.length - 1 && (
                      <View style={[styles.dayConnector, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.dayTitleContainer}>
                    <Text style={[styles.dayTitleNew, { color: colors.text }]}>{day.title}</Text>
                    <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
                      {day.activities.length} activities
                    </Text>
                  </View>
                </View>

                {/* Activities - Timeline Style */}
                {day.activities.map((activity, aIdx) => (
                  <View key={aIdx} style={styles.activityItemNew}>
                    <View style={styles.activityLeft}>
                      <View style={[styles.timeContainer, { backgroundColor: colors.backgroundAlt }]}>
                        <Ionicons name="time-outline" size={12} color={colors.primary} />
                        <Text style={[styles.timeTextNew, { color: colors.textSecondary }]}>
                          {activity.time}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.activityCard, { backgroundColor: colors.card }, shadows.sm]}>
                      <Text style={[styles.activityNameNew, { color: colors.text }]}>
                        {activity.activity}
                      </Text>
                      <View style={styles.activityLocationRow}>
                        <Ionicons name="location" size={14} color={colors.accent} />
                        <Text style={[styles.activityLocationNew, { color: colors.textSecondary }]}>
                          {activity.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'budget' && (
          <View style={styles.budgetTab}>
            {/* Total Cost Card - Hero */}
            <LinearGradient
              colors={['#2679FF', '#00C896']}
              style={[styles.totalCostCard, shadows.lg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.totalCostLabel}>Total Trip Cost</Text>
              <Text style={styles.totalCostAmount}>
                {trip.currency} {trip.budget.total.toLocaleString()}
              </Text>
              <View style={styles.perPersonBadge}>
                <Ionicons name="person" size={14} color="#FFFFFF" />
                <Text style={styles.perPersonBadgeText}>
                  {trip.currency} {trip.budget.perPerson.toLocaleString()} per person
                </Text>
              </View>
            </LinearGradient>

            {/* Budget Breakdown */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cost Breakdown</Text>
              
              {[
                { label: 'Accommodation', amount: trip.budget.accommodation, icon: 'bed', color: '#2679FF', percent: (trip.budget.accommodation / trip.budget.total * 100).toFixed(0) },
                { label: 'Food', amount: trip.budget.food, icon: 'restaurant', color: '#00C896', percent: (trip.budget.food / trip.budget.total * 100).toFixed(0) },
                { label: 'Transport', amount: trip.budget.transport, icon: 'car', color: '#FF9500', percent: (trip.budget.transport / trip.budget.total * 100).toFixed(0) },
                { label: 'Activities', amount: trip.budget.activities, icon: 'flame', color: '#FF3B30', percent: (trip.budget.activities / trip.budget.total * 100).toFixed(0) },
              ].map((item, idx) => (
                <View key={idx} style={[styles.budgetItemNew, { backgroundColor: colors.card }, shadows.sm]}>
                  <View style={styles.budgetItemHeader}>
                    <View style={styles.budgetItemLeft}>
                      <View style={[styles.budgetIconNew, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      <View>
                        <Text style={[styles.budgetLabelNew, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.budgetPercent, { color: colors.textSecondary }]}>
                          {item.percent}% of total
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.budgetAmountNew, { color: colors.text }]}>
                      {trip.currency} {item.amount.toLocaleString()}
                    </Text>
                  </View>
                  {/* Progress Bar */}
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.backgroundAlt }]}>
                    <View 
                      style={[
                        styles.progressBar,
                        { width: `${item.percent}%`, backgroundColor: item.color }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Tips Card */}
            <View style={[styles.tipsCard, { backgroundColor: colors.card }, shadows.sm]}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={24} color="#FF9500" />
                <Text style={[styles.tipsTitle, { color: colors.text }]}>Money Saving Tips</Text>
              </View>
              <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                • Book accommodation 2 weeks in advance for better rates{'\n'}
                • Eat at local restaurants to save on food costs{'\n'}
                • Use shared transport when possible{'\n'}
                • Many activities offer group discounts
              </Text>
            </View>
          </View>
        )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: colors.card }, shadows.lg]}>
        <View style={styles.ctaLeft}>
          <Text style={[styles.ctaPrice, { color: colors.text }]}>
            {trip.currency} {(trip.cost / 1000).toFixed(1)}k
          </Text>
          <Text style={[styles.ctaPriceLabel, { color: colors.textSecondary }]}>
            per person
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <LinearGradient
            colors={['#2679FF', '#00C896']}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Floating Header (Animated)
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  // Top Buttons (Over Image)
  topButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButtonLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Hero Section
  heroContainer: {
    height: height * 0.5,
    width: width,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  heroStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statItemText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  heroLocationText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  heroBadgeText: {
    color: '#000000',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Author Card
  authorCard: {
    marginTop: -30,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  authorCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.md,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  authorDetails: {
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
    fontWeight: FONT_WEIGHTS.bold,
  },
  authorBio: {
    fontSize: FONT_SIZES.xs,
  },
  followButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  followButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  activeTab: {
    // Dynamic styles applied inline
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
  },
  // Content
  content: {
    paddingHorizontal: SPACING.lg,
  },
  // Overview Tab
  overviewTab: {},
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
  },
  galleryScroll: {
    gap: SPACING.sm,
  },
  galleryItem: {
    width: width * 0.6,
    height: 200,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  highlightCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  highlightLabel: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  description: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  // Itinerary Tab
  itineraryTab: {
    gap: SPACING.xl,
  },
  daySection: {
    marginBottom: SPACING.md,
  },
  dayHeaderNew: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  dayNumberContainer: {
    alignItems: 'center',
  },
  dayNumberGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  dayConnector: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: SPACING.xs,
  },
  dayTitleContainer: {
    flex: 1,
    paddingTop: SPACING.xs,
  },
  dayTitleNew: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 4,
  },
  daySubtitle: {
    fontSize: FONT_SIZES.sm,
  },
  activityItemNew: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xxl + SPACING.md,
    gap: SPACING.md,
  },
  activityLeft: {
    paddingTop: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  timeTextNew: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  activityCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  activityNameNew: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  activityLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityLocationNew: {
    fontSize: FONT_SIZES.sm,
  },
  // Budget Tab
  budgetTab: {},
  totalCostCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  totalCostLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
  },
  totalCostAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
  },
  perPersonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  perPersonBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  budgetItemNew: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  budgetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  budgetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  budgetIconNew: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetLabelNew: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 2,
  },
  budgetPercent: {
    fontSize: FONT_SIZES.xs,
  },
  budgetAmountNew: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  tipsCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  tipsText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  // Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  ctaLeft: {},
  ctaPrice: {
    fontSize: FONT_SIZES.xl + 2,
    fontWeight: FONT_WEIGHTS.bold,
  },
  ctaPriceLabel: {
    fontSize: FONT_SIZES.sm,
  },
  bookButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl + SPACING.sm,
    paddingVertical: SPACING.md + 2,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

export default PostDetailsScreen;
