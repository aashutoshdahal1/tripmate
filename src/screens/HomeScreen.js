import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { Video, ResizeMode } from 'expo-av';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { getFeedPosts } from '../services/postService';

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎯 HomeScreen - Expert UX Principles Applied
 * ═══════════════════════════════════════════════════════════════
 * 
 * 📐 VISUAL HIERARCHY (Fitts' Law):
 * • 70-75% screen real estate for video content
 * • Minimal top bar (56px) → keeps focus on content
 * • Large, thumb-reachable buttons (44x44 minimum)
 * • Floating CTA positioned in natural thumb zone
 * 
 * 🎨 COLOR PSYCHOLOGY:
 * • Background: #F7F9FC (soft neutral) → reduces eye fatigue
 * • Primary: #2679FF (blue) → trust, action, natural eye gravity
 * • Accent: #00C896 (green) → positive cue for "Save/Go"
 * • 2-3 colors max per screen → reduces cognitive load
 * 
 * 🧠 PSYCHOLOGICAL TRIGGERS:
 * • Double-tap like → instant gratification (Instagram pattern)
 * • Micro-animations → rewarding feedback loops
 * • Save bounce → tactile confirmation
 * • Glanceable content (<3 sec scan) → location, days, cost overlay
 * 
 * 👆 GESTURE PATTERNS (Hick's Law):
 * • Vertical scroll (primary) → natural mobile pattern
 * • Horizontal carousel (secondary) → familiar exploration
 * • Double-tap to like → reduces decision fatigue
 * • Single tap to expand → clear action hierarchy
 * 
 * 🎬 ENGAGEMENT HOOKS:
 * • Video autoplay on mute (recommended) → instant visual hook
 * • AI suggestions inline → personalized concierge feel
 * • Map preview badge → encourages exploration
 * • Cost + days overlay → no-click info access
 * 
 * ♿️ ACCESSIBILITY:
 * • Minimum 44x44pt touch targets (Fitts' Law)
 * • High contrast text on video overlays
 * • Clear visual feedback on all interactions
 * • Consistent button patterns throughout
 * 
 * 🚀 RETENTION STRATEGIES:
 * • Pulse animation on upload button → idle nudge
 * • Notification dot → curiosity trigger
 * • AI personalization → "just for you" feeling
 * • Social proof → likes, comments visible
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width;
const CARD_HEIGHT = height; // Full screen height for TikTok-style
const VIDEO_HEIGHT = CARD_HEIGHT; // Video takes full card height

const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows, isDark } = useTheme();
  const [savedTrips, setSavedTrips] = useState([]);
  const [likedTrips, setLikedTrips] = useState([]);
  const [playingVideos, setPlayingVideos] = useState({}); // Track video play state
  const [mutedVideos, setMutedVideos] = useState({}); // Track mute state per video
  const videoRefs = useRef({}); // Store video refs for each trip
  const [showOverlays, setShowOverlays] = useState({}); // Track overlay visibility per video
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // Track currently visible video
  const flatListRef = useRef(null); // Reference to FlatList
  
  // Dynamic data state
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Animation refs
  const likeAnimRefs = useRef({});
  const saveAnimRefs = useRef({});
  const overlayAnimRefs = useRef({}); // Animation for overlay show/hide
  const cardEnterAnimRefs = useRef({}); // Animation for card entrance
  
  // Pinch-to-zoom refs
  const scaleAnimRefs = useRef({});
  const baseScaleRefs = useRef({});
  
  // Double-tap handling
  const lastTap = useRef(null);

  // 📹 Fetch posts from API
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      console.log('🔄 Loading posts, page:', pageNum);
      const response = await getFeedPosts(pageNum, 10);
      
      if (response && response.data) {
        const newTrips = response.data.map(post => ({
          id: post._id,
          videoUrl: post.media?.url || '',
          thumbnail: post.media?.thumbnail || post.media?.url,
          title: post.title,
          location: post.location?.name || 'Unknown',
          country: 'Nepal', // Default for now
          days: post.tripDetails?.duration || 0,
          cost: post.tripDetails?.budget?.amount || 0,
          currency: post.tripDetails?.budget?.currency || 'NPR',
          author: {
            name: post.user?.fullName || 'Anonymous',
            avatar: post.user?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          },
          likes: post.stats?.likes || 0,
          comments: post.stats?.comments || 0,
          saved: false,
          isAISuggestion: post.isAIGenerated || false,
        }));

        if (shouldRefresh || pageNum === 1) {
          setTrips(newTrips);
          setPage(1);
        } else {
          setTrips(prev => [...prev, ...newTrips]);
        }

        setHasMore(newTrips.length === 10);
        console.log('✅ Loaded', newTrips.length, 'posts');
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      // Show fallback data on error for first load
      if (pageNum === 1 && !shouldRefresh) {
        setTrips(getFallbackTrips());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadPosts(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
      setPage(prev => prev + 1);
    }
  };

  // Fallback data if API fails
  const getFallbackTrips = () => [
    {
      id: 'fallback-1',
      videoUrl: 'https://www.pexels.com/download/video/5896379/',
      thumbnail: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg',
      title: 'Hidden Paradise in the Mountains',
      location: 'Pokhara',
      country: 'Nepal',
      days: 3,
      cost: 12500,
      currency: 'NPR',
      author: {
        name: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      likes: 1240,
      comments: 89,
      saved: false,
      isAISuggestion: false,
    },
  ];

  const firstTripId = trips[0]?.id;
  const getAnimValue = (tripId, type) => {
    const refs = type === 'like' ? likeAnimRefs : saveAnimRefs;
    if (!refs.current[tripId]) {
      refs.current[tripId] = new Animated.Value(0);
    }
    return refs.current[tripId];
  };

  // Get or create scale animation value for pinch-to-zoom
  const getScaleAnimValue = (tripId) => {
    if (!scaleAnimRefs.current[tripId]) {
      scaleAnimRefs.current[tripId] = new Animated.Value(1);
      baseScaleRefs.current[tripId] = 1;
    }
    return scaleAnimRefs.current[tripId];
  };

  // Get or create card entrance animation value
  const getCardEnterAnimValue = (tripId) => {
    if (!cardEnterAnimRefs.current[tripId]) {
      const anim = new Animated.Value(0);
      cardEnterAnimRefs.current[tripId] = anim;
      
      // Trigger entrance animation
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
    return cardEnterAnimRefs.current[tripId];
  };

  // Sample trending destinations for carousel
  const trendingDestinations = [
    { id: 't1', name: 'Annapurna', image: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg' },
    { id: 't2', name: 'Everest', image: 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg' },
    { id: 't3', name: 'Lumbini', image: 'https://images.pexels.com/photos/5363663/pexels-photo-5363663.jpeg' },
    { id: 't4', name: 'Mustang', image: 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg' },
  ];

  // Stories - Trip highlights (like Instagram Stories)
  const stories = [
    { id: 'add', type: 'add', user: 'Your Story', avatar: null },
    { id: 's1', user: 'Sarah', avatar: 'https://i.pravatar.cc/150?img=1', hasNew: true },
    { id: 's2', user: 'Mike', avatar: 'https://i.pravatar.cc/150?img=12', hasNew: true },
    { id: 's3', user: 'Emma', avatar: 'https://i.pravatar.cc/150?img=5', hasNew: false },
    { id: 's4', user: 'John', avatar: 'https://i.pravatar.cc/150?img=8', hasNew: true },
    { id: 's5', user: 'Lisa', avatar: 'https://i.pravatar.cc/150?img=9', hasNew: false },
  ];

  // Get or create overlay animation value
  const getOverlayAnimValue = (tripId) => {
    if (!overlayAnimRefs.current[tripId]) {
      // Check if this is the first trip - start visible (1), otherwise hidden (0)
      const isFirstTrip = tripId === firstTripId;
      overlayAnimRefs.current[tripId] = new Animated.Value(isFirstTrip ? 1 : 0);
    }
    return overlayAnimRefs.current[tripId];
  };

  // Initialize overlays - first video visible, others hidden
  useEffect(() => {
    const initialOverlays = {};
    const initialMuted = {};
    trips.forEach((trip, index) => {
      initialOverlays[trip.id] = index === 0; // Only first video visible
      initialMuted[trip.id] = false; // Start with sound ON for all videos
    });
    setShowOverlays(initialOverlays);
    setMutedVideos(initialMuted);

    // Hide first video overlay after 3 seconds
    const timer = setTimeout(() => {
      if (trips.length > 0) {
        const firstTripId = trips[0].id;
        const overlayAnim = getOverlayAnimValue(firstTripId);
        
        // Animate out
        Animated.spring(overlayAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 50,
        }).start();
        
        // Update state
        setShowOverlays(prev => ({
          ...prev,
          [firstTripId]: false
        }));
      }
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
    };
  }, [trips]); // Re-run when trips change

  const handleTripPress = (trip) => {
    navigation.navigate('PostDetails', { tripId: trip.id });
  };

  // Double-tap to like with animation, Single-tap to toggle overlay
  const handleDoubleTap = (tripId) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 250; // Reduced for better responsiveness

    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected - trigger like animation immediately
      lastTap.current = null; // Reset immediately
      triggerLikeAnimation(tripId);
      setLikedTrips((prev) =>
        prev.includes(tripId) ? prev : [...prev, tripId]
      );
    } else {
      // First tap - wait to see if there's a second tap
      lastTap.current = now;
      
      // Set a timeout to handle single tap after delay
      setTimeout(() => {
        if (lastTap.current === now) {
          // No double-tap detected, this was a single tap
          lastTap.current = null; // Reset
          
          // Toggle overlay with animation
          const overlayAnim = getOverlayAnimValue(tripId);
          const isCurrentlyVisible = showOverlays[tripId];
          
          // Animate out or in
          Animated.spring(overlayAnim, {
            toValue: isCurrentlyVisible ? 0 : 1,
            useNativeDriver: true,
            friction: 8,
            tension: 50,
          }).start();
          
          // Update state
          setShowOverlays(prev => ({
            ...prev,
            [tripId]: !isCurrentlyVisible
          }));
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Like animation (heart pop from center)
  const triggerLikeAnimation = (tripId) => {
    const animValue = getAnimValue(tripId, 'like');
    
    // Reset and animate with delightful spring
    animValue.setValue(0);
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Save button bounce animation
  const triggerSaveAnimation = (tripId) => {
    const animValue = getAnimValue(tripId, 'save');
    
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 0,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSave = (tripId) => {
    triggerSaveAnimation(tripId);
    setSavedTrips((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleLikeButton = (tripId) => {
    // Add haptic feedback feel with animation
    const animValue = getAnimValue(tripId, 'like');
    Animated.sequence([
      Animated.spring(animValue, {
        toValue: 0.5,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 0,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setLikedTrips((prev) =>
      prev.includes(tripId)
        ? prev.filter((id) => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleSearch = () => {
    navigation.navigate('ExploreTab');
  };

  // Toggle mute/unmute for video
  const toggleMute = (tripId) => {
    setMutedVideos(prev => ({
      ...prev,
      [tripId]: !prev[tripId]
    }));
  };

  // Single tap on video - could add play/pause toggle in future
  const handleVideoTap = (tripId) => {
    console.log(`Now playing: ${trips.find(t => t.id === tripId)?.location}`);
  };

  // Handle pinch gesture for zoom
  const handlePinchGesture = (tripId) => (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const scale = event.nativeEvent.scale;
      const scaleAnim = getScaleAnimValue(tripId);
      const baseScale = baseScaleRefs.current[tripId] || 1;
      
      // Apply the pinch scale relative to the base scale
      const newScale = Math.max(1, Math.min(baseScale * scale, 3)); // Clamp between 1x and 3x
      scaleAnim.setValue(newScale);
    }

    if (event.nativeEvent.state === State.END) {
      const scaleAnim = getScaleAnimValue(tripId);
      // Get the current scale value
      const currentScale = scaleAnim._value;
      
      // Update base scale for next pinch gesture
      baseScaleRefs.current[tripId] = currentScale;
      
      // If zoomed out below 1, snap back to 1
      if (currentScale < 1) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
        }).start();
        baseScaleRefs.current[tripId] = 1;
      }
    }
  };

  // Handle viewable items change (for video autoplay control)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentVideoIndex(visibleIndex);
      
      // Optional: Mute all other videos when switching
      const visibleTripId = trips[visibleIndex]?.id;
      if (visibleTripId) {
        // Keep the mute state of current video, but we could auto-mute others if needed
        console.log('📺 Now viewing:', trips[visibleIndex]?.title);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Item is considered visible when 80% is in view
  }).current;

  // Render individual video item
  const renderVideoItem = ({ item: trip, index }) => {
    return (
      <View style={styles.videoItemContainer}>
        {/* AI Suggestion Banner - Personalized Concierge Feel */}
        {trip.isAISuggestion && (
          <View style={[styles.aiSuggestionBanner, { backgroundColor: colors.accentAlpha }]}>
            <Ionicons name="sparkles" size={14} color={colors.accent} />
            <Text style={[styles.aiSuggestionText, { color: colors.accent }]}>
              Perfect for your budget • AI-curated just for you
            </Text>
          </View>
        )}

        {/* Trip Card - Full Height Video Background with Entrance Animation */}
        <Animated.View 
          style={[
            styles.tripCard, 
            shadows.md,
            {
              opacity: getCardEnterAnimValue(trip.id),
              transform: [
                {
                  scale: getCardEnterAnimValue(trip.id).interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
                {
                  translateY: getCardEnterAnimValue(trip.id).interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Video Section - Full Card Height */}
          <PinchGestureHandler
            onGestureEvent={handlePinchGesture(trip.id)}
            onHandlerStateChange={handlePinchGesture(trip.id)}
          >
            <Animated.View
              style={[
                styles.videoContainer,
                {
                  transform: [{ scale: getScaleAnimValue(trip.id) }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.videoTouchable}
                activeOpacity={1}
                onPress={() => handleDoubleTap(trip.id)}
              >
                {/* Video Player - Auto-play with sound */}
                <Video
                  ref={(ref) => {
                    if (ref) videoRefs.current[trip.id] = ref;
                  }}
                  source={{ uri: trip.videoUrl }}
                  style={styles.videoThumbnail}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={index === currentVideoIndex}
                  isLooping={true}
                  isMuted={mutedVideos[trip.id] !== false} // false = unmuted (sound ON), true = muted
                  volume={mutedVideos[trip.id] === false ? 1.0 : 0.0}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && status.isPlaying) {
                      setPlayingVideos(prev => ({ ...prev, [trip.id]: status.isPlaying }));
                    }
                  }}
                  pointerEvents="none"
                />

                {/* Double-tap Like Animation Overlay */}
                <Animated.View
                  style={[
                    styles.likeAnimationOverlay,
                    {
                      opacity: getAnimValue(trip.id, 'like'),
                      transform: [
                        {
                          scale: getAnimValue(trip.id, 'like').interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                  pointerEvents="none"
                >
                  <Ionicons name="heart" size={100} color="#FF3B30" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </PinchGestureHandler>

          {/* Profile & Actions - Always Visible at Bottom */}
          <View
            style={styles.alwaysVisibleOverlay}
            pointerEvents="box-none"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
              style={styles.bottomGradient}
              locations={[0, 0.6, 1]}
              pointerEvents="box-none"
            >
              {/* Author & Interactions - Always Visible */}
              <View style={styles.interactionRow}>
              {/* Author Info */}
              <TouchableOpacity 
                style={styles.authorInfo} 
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!trip.isAISuggestion) {
                    navigation.navigate('UserProfile', {
                      userId: trip.author.name.toLowerCase().replace(/\s+/g, ''),
                      userName: trip.author.name,
                      userAvatar: trip.author.avatar,
                    });
                  }
                }}
              >
                {trip.isAISuggestion ? (
                  <View style={[styles.aiAvatar, { backgroundColor: 'rgba(0,200,150,0.25)', borderWidth: 1.5, borderColor: colors.accent }]}>
                    <Ionicons name="sparkles" size={14} color={colors.accent} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: trip.author?.avatar || 'https://i.pravatar.cc/150?img=0' }}
                    style={styles.authorAvatar}
                  />
                )}
                <Text style={styles.authorName} numberOfLines={1}>
                  {trip.author?.name || 'Unknown'}
                </Text>
              </TouchableOpacity>
              {/* Interaction Buttons - Always Visible */}
              <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleLikeButton(trip.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={likedTrips.includes(trip.id) ? "heart" : "heart-outline"} 
                      size={22} 
                      color={likedTrips.includes(trip.id) ? "#FF3B30" : "#FFFFFF"}
                    />
                    <Text style={[
                      styles.actionText, 
                      { color: likedTrips.includes(trip.id) ? "#FF3B30" : "#FFFFFF" }
                    ]}>
                      {formatNumber((trip.likes || 0) + (likedTrips.includes(trip.id) ? 1 : 0))}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      // Navigate to comments in future
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                    <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                      {trip.comments || 0}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleMute(trip.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={mutedVideos[trip.id] === false ? "volume-high" : "volume-mute"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => e.stopPropagation()}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Title and Map Preview - Toggle with Single Tap */}
          <Animated.View
            style={[
              styles.titleOverlay,
              {
                opacity: getOverlayAnimValue(trip.id),
                transform: [
                  {
                    translateY: getOverlayAnimValue(trip.id).interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0], // Slide up from bottom
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={showOverlays[trip.id] ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handleTripPress(trip)}
              activeOpacity={0.98}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.titleGradient}
                locations={[0, 1]}
              >
                {/* Trip Title - Bold, Scannable */}
                <Text style={styles.tripTitle} numberOfLines={2}>
                  {trip.title || 'Untitled Trip'}
                </Text>

                {/* Map Thumbnail Preview - Glass Morphism */}
                <TouchableOpacity 
                  style={styles.mapPreview}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('PostDetails', { tripId: trip.id, tab: 'Itinerary' });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.mapIconContainer}>
                    <Ionicons name="map" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.mapPreviewText}>
                    View interactive route
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar - Floating Over Video */}
      <View style={styles.topBarFloating}>
        {/* Logo - Brand Reinforcement */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="airplane" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>TripMate</Text>
        </View>

        {/* Right Actions - Subtle, Always Available */}
        <View style={styles.topBarActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('NotificationsTab')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            {/* Notification Badge - Triggers Curiosity */}
            <View style={[styles.notificationDot, { backgroundColor: '#FF3B30' }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* TikTok-Style Video Feed */}
      {loading && trips.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2679FF" />
          <Text style={styles.loadingText}>Loading amazing trips...</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="earth-outline" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>No trips yet</Text>
          <Text style={styles.emptySubtext}>Be the first to share your adventure!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={trips}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={CARD_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: CARD_HEIGHT,
            offset: CARD_HEIGHT * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#2679FF']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && trips.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#2679FF" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  footerLoader: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoItemContainer: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
  },
  // Top Bar - Floating Over Video (TikTok style)
  topBarFloating: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  aiSuggestionBanner: {
    position: 'absolute',
    top: 110,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  aiSuggestionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Trip Card - Full Screen (TikTok style)
  tripCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  // Video Section - Full Screen Height
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Double-tap Like Animation
  likeAnimationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Always visible section at bottom
  alwaysVisibleOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 6,
  },
  bottomGradient: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  // Title overlay - toggles with single tap
  titleOverlay: {
    position: 'absolute',
    bottom: 150, // Position above the always-visible section
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 5,
  },
  titleGradient: {
    paddingVertical: 16,
  },
  tripTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
    lineHeight: 28,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mapPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(38, 121, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  mapPreviewText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 50,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;

