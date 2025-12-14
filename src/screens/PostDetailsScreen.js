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
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { getPostById } from '../services/postService';
import { generateAIItinerary } from '../services/aiService';

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
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [generatingItinerary, setGeneratingItinerary] = useState(false);
  const [showGenerated, setShowGenerated] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const saveAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);
  const mapRef = useRef(null);

  // Fetch post data on mount
  useEffect(() => {
    if (id) {
      fetchPostData();
    } else {
      setError('No post ID provided');
      setLoading(false);
    }
  }, [id]);

  // Auto-generate itinerary when user opens itinerary tab without existing itinerary
  useEffect(() => {
    if (
      activeTab === 'itinerary' &&
      post &&
      userLocation &&
      distance !== null &&
      !post.tripDetails?.itinerary?.length &&
      !generatedItinerary &&
      !generatingItinerary
    ) {
      // Auto-trigger generation after a short delay
      const timer = setTimeout(() => {
        console.log('🤖 Auto-triggering itinerary generation...');
        generateSmartItinerary();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, post, userLocation, distance, generatedItinerary]);

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
      
      // Fetch user location if post has coordinates
      if (data.location?.coordinates?.latitude && data.location?.coordinates?.longitude) {
        fetchUserLocation(data.location.coordinates);
      }
    } catch (err) {
      console.error('❌ Error loading post:', err);
      setError(err.message || 'Failed to load post');
      Alert.alert('Error', 'Failed to load post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLocation = async (destinationCoords) => {
    try {
      setLoadingLocation(true);
      console.log('📍 Fetching user location...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      // Calculate distance using Haversine formula
      const dist = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude
      );

      setDistance(dist);
      console.log('✅ Distance calculated:', dist.toFixed(2), 'km');
    } catch (err) {
      console.error('❌ Error fetching location:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const fitMapToMarkers = () => {
    if (mapRef.current && userLocation && post?.location?.coordinates) {
      // Don't auto-fit if distance is too large (> 1000 km)
      // This prevents map crashes with very distant locations
      if (distance > 1000) {
        console.log('⚠️ Distance too large for auto-fit, keeping default view');
        return;
      }

      try {
        mapRef.current.fitToCoordinates(
          [
            userLocation,
            {
              latitude: post.location.coordinates.latitude,
              longitude: post.location.coordinates.longitude,
            },
          ],
          {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          }
        );
      } catch (err) {
        console.error('❌ Error fitting map to markers:', err);
      }
    }
  };

  const tabs = [
    { id: 'vlog', label: 'Vlog', icon: 'play-circle' },
    { id: 'route', label: 'Route', icon: 'navigate' },
    { id: 'itinerary', label: 'Itinerary', icon: 'map' },
    { id: 'budget', label: 'Budget', icon: 'wallet' },
  ];

  const openInMaps = async (latitude, longitude, label) => {
    try {
      const destination = `${latitude},${longitude}`;
      const encodedLabel = encodeURIComponent(label);
      
      let url;
      if (Platform.OS === 'ios') {
        // Try Google Maps first if installed
        const gmapsUrl = `comgooglemaps://?daddr=${destination}&directionsmode=driving`;
        const canOpenGmaps = await Linking.canOpenURL(gmapsUrl);
        
        if (canOpenGmaps) {
          url = gmapsUrl;
        } else {
          // Fallback to Apple Maps
          url = `maps://app?daddr=${destination}&q=${encodedLabel}`;
        }
      } else {
        // Android - try Google Maps app first
        const gmapsUrl = `google.navigation:q=${destination}`;
        const canOpenGmaps = await Linking.canOpenURL(gmapsUrl);
        
        if (canOpenGmaps) {
          url = gmapsUrl;
        } else {
          // Fallback to web maps
          url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        }
      }
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Could not open maps. Please install Google Maps or Apple Maps.'
        );
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(
        'Error',
        'Failed to open maps. Please try again.'
      );
    }
  };

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

  const generateSmartItinerary = async () => {
    if (!userLocation || !post?.location?.coordinates || !distance) {
      Alert.alert(
        'Location Required',
        'Please enable location services to generate a personalized itinerary.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setGeneratingItinerary(true);
      console.log('🤖 Calling Gemini AI to generate itinerary...');
      console.log('📍 From:', userLocation);
      console.log('📍 To:', post.location.coordinates);
      console.log('📏 Distance:', distance, 'km');
      console.log('🎯 Interests:', post.tripDetails?.interests);
      console.log('💰 Budget:', post.tripDetails?.budget?.amount);

      // Prepare data for AI API
      const requestData = {
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        destinationLocation: {
          latitude: post.location.coordinates.latitude,
          longitude: post.location.coordinates.longitude,
        },
        distance: distance,
        destinationName: post.location?.name || post.location?.address || post.title || 'Unknown Destination',
        destinationAddress: post.location?.address || '',
        duration: post.tripDetails?.duration || null,
        budget: post.tripDetails?.budget?.amount || null,
        interests: post.tripDetails?.interests || [],
        tripType: post.tripDetails?.tripType || 'leisure',
      };

      console.log('📤 Sending request to AI API:', requestData);

      // Call AI API
      const response = await generateAIItinerary(requestData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate itinerary');
      }

      const aiData = response.data;
      
      console.log('✅ AI itinerary received!');
      console.log('📊 Duration:', aiData.duration, 'days');
      console.log('💰 Total budget:', aiData.totalBudget);
      console.log('📝 Days:', aiData.itinerary.length);

      // Transform AI response to match our format
      const transformedItinerary = aiData.itinerary.map(day => ({
        day: day.day,
        title: day.title,
        activities: day.activities,
        budget: day.budget,
        generated: true,
        aiGenerated: true,
      }));

      setGeneratedItinerary(transformedItinerary);
      setShowGenerated(true);
      
      Alert.alert(
        '✨ AI Itinerary Generated!',
        `Gemini AI created a ${aiData.duration}-day personalized journey!\n\n` +
        `🎯 Interests: ${requestData.interests.length > 0 ? requestData.interests.join(', ') : 'general exploration'}\n` +
        `💰 Budget: NPR ${aiData.totalBudget.toLocaleString()}\n` +
        `📏 Distance: ${distance.toFixed(0)} km\n\n` +
        (aiData.tips && aiData.tips.length > 0 ? `💡 Tips included!` : ''),
        [{ text: 'View Itinerary' }]
      );
    } catch (error) {
      console.error('❌ Error generating AI itinerary:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate itinerary. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: generateSmartItinerary }
        ]
      );
    } finally {
      setGeneratingItinerary(false);
    }
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

          {activeTab === 'route' && (
            <View style={styles.tabContent}>
              {post.location?.coordinates?.latitude && post.location?.coordinates?.longitude ? (
                <>
                  {/* Distance Card */}
                  <View style={[styles.distanceCard, { backgroundColor: colors.card }, shadows.md]}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={styles.distanceGradient}
                    >
                      <View style={styles.distanceIconContainer}>
                        <Ionicons name="navigate-circle" size={48} color="#FFFFFF" />
                      </View>
                      <View style={styles.distanceInfo}>
                        {loadingLocation ? (
                          <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.distanceLabel}>Calculating distance...</Text>
                          </>
                        ) : distance !== null ? (
                          <>
                            <Text style={styles.distanceValue}>
                              {distance < 1 
                                ? `${(distance * 1000).toFixed(0)} m` 
                                : distance > 1000
                                ? `${(distance / 1000).toFixed(1)}k km`
                                : `${distance.toFixed(1)} km`}
                            </Text>
                            <Text style={styles.distanceLabel}>Distance from you</Text>
                            <View style={styles.estimateRow}>
                              <Ionicons 
                                name={distance > 500 ? "airplane-outline" : "car-outline"} 
                                size={16} 
                                color="#FFFFFF" 
                              />
                              <Text style={styles.estimateText}>
                                {distance > 500 
                                  ? `~${Math.ceil(distance / 800)} hrs by flight`
                                  : `~${Math.ceil(distance / 60)} hrs by car`}
                              </Text>
                            </View>
                          </>
                        ) : (
                          <Text style={styles.distanceLabel}>Enable location to see distance</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Location Details */}
                  <View style={[styles.locationDetails, { backgroundColor: colors.card }, shadows.sm]}>
                    <View style={styles.locationDetailRow}>
                      <Ionicons name="location" size={20} color={colors.primary} />
                      <View style={styles.locationDetailText}>
                        <Text style={[styles.locationDetailLabel, { color: colors.textSecondary }]}>
                          Destination
                        </Text>
                        <Text style={[styles.locationDetailValue, { color: colors.text }]}>
                          {post.location.name || 'Unknown Location'}
                        </Text>
                      </View>
                    </View>
                    {post.location.address && (
                      <View style={styles.locationDetailRow}>
                        <Ionicons name="map-outline" size={20} color={colors.accent} />
                        <View style={styles.locationDetailText}>
                          <Text style={[styles.locationDetailLabel, { color: colors.textSecondary }]}>
                            Address
                          </Text>
                          <Text style={[styles.locationDetailValue, { color: colors.text }]}>
                            {post.location.address}
                          </Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.locationDetailRow}>
                      <Ionicons name="compass-outline" size={20} color={colors.accent} />
                      <View style={styles.locationDetailText}>
                        <Text style={[styles.locationDetailLabel, { color: colors.textSecondary }]}>
                          Coordinates
                        </Text>
                        <Text style={[styles.locationDetailValue, { color: colors.text }]}>
                          {post.location.coordinates.latitude.toFixed(4)}, {post.location.coordinates.longitude.toFixed(4)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3D Map View */}
                  <View style={[styles.mapContainer, shadows.lg]}>
                    <MapView
                      ref={mapRef}
                      provider={PROVIDER_GOOGLE}
                      style={styles.map}
                      initialRegion={{
                        latitude: post.location.coordinates.latitude,
                        longitude: post.location.coordinates.longitude,
                        // Cap deltas to prevent crashes with very far distances
                        // Use smaller deltas for large distances to keep map focused
                        latitudeDelta: userLocation && distance !== null
                          ? (distance > 1000 
                              ? 0.5 
                              : Math.min(Math.max(Math.abs(userLocation.latitude - post.location.coordinates.latitude) * 2, 0.05), 20))
                          : 0.1,
                        longitudeDelta: userLocation && distance !== null
                          ? (distance > 1000 
                              ? 0.5 
                              : Math.min(Math.max(Math.abs(userLocation.longitude - post.location.coordinates.longitude) * 2, 0.05), 20))
                          : 0.1,
                      }}
                      camera={{
                        center: {
                          latitude: post.location.coordinates.latitude,
                          longitude: post.location.coordinates.longitude,
                        },
                        pitch: distance > 1000 ? 0 : 60, // Use flat view for very far distances
                        heading: 0,
                        altitude: distance > 1000 ? 10000 : 3000, // Higher altitude for far distances
                        zoom: distance > 1000 ? 4 : 12, // Zoom out for far distances
                      }}
                      mapType="satellite"
                      showsBuildings={distance <= 1000} // Only show buildings for closer destinations
                      showsTraffic={false}
                      showsIndoors={distance <= 1000}
                      onMapReady={fitMapToMarkers}
                    >
                      {/* Destination Marker */}
                      <Marker
                        coordinate={{
                          latitude: post.location.coordinates.latitude,
                          longitude: post.location.coordinates.longitude,
                        }}
                        title={post.location.name}
                        description="Trip Destination"
                      >
                        <View style={styles.destinationMarker}>
                          <View style={[styles.markerPulse, { backgroundColor: colors.accent }]} />
                          <View style={[styles.markerInner, { backgroundColor: colors.accent }]}>
                            <Ionicons name="flag" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                      </Marker>

                      {/* User Location Marker */}
                      {userLocation && (
                        <Marker
                          coordinate={userLocation}
                          title="Your Location"
                          description="Current Position"
                        >
                          <View style={styles.userMarker}>
                            <View style={[styles.markerPulse, { backgroundColor: colors.primary }]} />
                            <View style={[styles.markerInner, { backgroundColor: colors.primary }]}>
                              <Ionicons name="person" size={16} color="#FFFFFF" />
                            </View>
                          </View>
                        </Marker>
                      )}

                      {/* Route Line - Only show for distances under 1000km */}
                      {userLocation && distance !== null && distance < 1000 && (
                        <Polyline
                          coordinates={[
                            userLocation,
                            {
                              latitude: post.location.coordinates.latitude,
                              longitude: post.location.coordinates.longitude,
                            },
                          ]}
                          strokeColor={colors.primary}
                          strokeWidth={3}
                          lineDashPattern={[10, 5]}
                        />
                      )}
                    </MapView>

                    {/* Map Controls */}
                    <View style={styles.mapControls}>
                      <TouchableOpacity
                        style={[styles.mapControlButton, { backgroundColor: colors.card }, shadows.sm]}
                        onPress={() => {
                          if (distance > 1000) {
                            Alert.alert(
                              'Distance Too Large',
                              'The destination is over 1,000 km away. Map view is focused on the destination.',
                              [{ text: 'OK' }]
                            );
                          } else {
                            fitMapToMarkers();
                          }
                        }}
                      >
                        <Ionicons name="contract-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.mapControlButton, { backgroundColor: colors.card }, shadows.sm]}
                        onPress={() => {
                          if (mapRef.current) {
                            mapRef.current.animateCamera({
                              center: {
                                latitude: post.location.coordinates.latitude,
                                longitude: post.location.coordinates.longitude,
                              },
                              pitch: 60,
                              heading: 0,
                              altitude: 3000,
                              zoom: 15,
                            });
                          }
                        }}
                      >
                        <Ionicons name="cube-outline" size={20} color={colors.accent} />
                      </TouchableOpacity>
                    </View>

                    {/* Map Legend */}
                    <View style={[styles.mapLegend, { backgroundColor: colors.card + 'DD' }]}>
                      <Text style={[styles.mapLegendTitle, { color: colors.text }]}>
                        {distance > 1000 ? 'Satellite View' : '3D Satellite View'}
                      </Text>
                      <Text style={[styles.mapLegendText, { color: colors.textSecondary }]}>
                        {distance > 1000 
                          ? 'Destination view • Route line hidden for very far distances'
                          : 'Pinch to zoom • Drag to pan • Two fingers to rotate'}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }, shadows.md]}
                      onPress={() => {
                        openInMaps(
                          post.location.coordinates.latitude,
                          post.location.coordinates.longitude,
                          post.location.name
                        );
                      }}
                    >
                      <Ionicons name="navigate" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.accent }, shadows.md]}
                      onPress={() => {
                        Alert.alert(
                          'Share Location',
                          `Share ${post.location.name} with friends?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Share', onPress: () => console.log('Sharing location') },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="share-social" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Share Route</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.emptyVlog}>
                  <Ionicons name="navigate-circle-outline" size={64} color={colors.textSecondary} />
                  <Text style={[styles.emptyVlogText, { color: colors.textSecondary }]}>
                    No location data available for this trip.
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'itinerary' && (
            <View style={styles.tabContent}>
              {/* AI Generate Button - Always show */}
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: colors.accent }, shadows.md]}
                onPress={generateSmartItinerary}
                disabled={generatingItinerary || !userLocation}
              >
                {generatingItinerary ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Generating Your Route...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>
                      {post.tripDetails?.itinerary && post.tripDetails.itinerary.length > 0
                        ? '✨ Generate Route-Based Itinerary'
                        : '🤖 Auto-Generate Smart Itinerary'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!userLocation && !loadingLocation && (
                <View style={[styles.infoBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                  <Text style={[styles.infoBoxText, { color: colors.primary }]}>
                    Enable location to generate a personalized itinerary from your current location to the destination
                  </Text>
                </View>
              )}

              {/* Toggle between original and generated */}
              {generatedItinerary && post.tripDetails?.itinerary && post.tripDetails.itinerary.length > 0 && (
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !showGenerated && { backgroundColor: colors.primary },
                      showGenerated && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
                    ]}
                    onPress={() => setShowGenerated(false)}
                  >
                    <Text style={[
                      styles.toggleButtonText,
                      !showGenerated ? { color: '#FFFFFF' } : { color: colors.text }
                    ]}>
                      Original Plan
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      showGenerated && { backgroundColor: colors.accent },
                      !showGenerated && { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
                    ]}
                    onPress={() => setShowGenerated(true)}
                  >
                    <Ionicons 
                      name="sparkles" 
                      size={16} 
                      color={showGenerated ? '#FFFFFF' : colors.text} 
                    />
                    <Text style={[
                      styles.toggleButtonText,
                      showGenerated ? { color: '#FFFFFF' } : { color: colors.text }
                    ]}>
                      AI Generated
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Display itinerary */}
              {(() => {
                const itineraryToShow = showGenerated && generatedItinerary 
                  ? generatedItinerary 
                  : post.tripDetails?.itinerary;

                if (itineraryToShow && itineraryToShow.length > 0) {
                  return (
                    <>
                      {showGenerated && generatedItinerary && (
                        <View style={[styles.aiPowerBanner, { backgroundColor: colors.accent }]}>
                          <LinearGradient
                            colors={[colors.accent, colors.accent + 'CC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.aiPowerGradient}
                          >
                            <View style={styles.aiPowerIcon}>
                              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.aiPowerContent}>
                              <Text style={styles.aiPowerTitle}>✨ AI-Powered Itinerary</Text>
                              <Text style={styles.aiPowerSubtitle}>
                                Personalized route • {distance?.toFixed(0)} km journey • Generated by Gemini AI
                              </Text>
                            </View>
                          </LinearGradient>
                        </View>
                      )}
                      
                      {/* Trip Overview Stats */}
                      <View style={styles.tripStatsContainer}>
                        <View style={[styles.tripStatCard, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name="calendar" size={20} color={colors.primary} />
                          <Text style={[styles.tripStatValue, { color: colors.primary }]}>
                            {itineraryToShow.length}
                          </Text>
                          <Text style={[styles.tripStatLabel, { color: colors.primary }]}>Days</Text>
                        </View>
                        <View style={[styles.tripStatCard, { backgroundColor: colors.accent + '15' }]}>
                          <Ionicons name="location" size={20} color={colors.accent} />
                          <Text style={[styles.tripStatValue, { color: colors.accent }]}>
                            {itineraryToShow.length * 3}+
                          </Text>
                          <Text style={[styles.tripStatLabel, { color: colors.accent }]}>Places</Text>
                        </View>
                        <View style={[styles.tripStatCard, { backgroundColor: '#00C896' + '15' }]}>
                          <Ionicons name="time" size={20} color="#00C896" />
                          <Text style={[styles.tripStatValue, { color: '#00C896' }]}>
                            {itineraryToShow.length * 8}+
                          </Text>
                          <Text style={[styles.tripStatLabel, { color: '#00C896' }]}>Hours</Text>
                        </View>
                      </View>

                      {/* Timeline View */}
                      <View style={styles.timelineContainer}>
                        {itineraryToShow.map((day, idx) => (
                          <View key={idx} style={styles.timelineItem}>
                            {/* Timeline Line */}
                            {idx !== itineraryToShow.length - 1 && (
                              <View style={[styles.timelineLine, { backgroundColor: showGenerated ? colors.accent + '30' : colors.primary + '30' }]} />
                            )}
                            
                            {/* Timeline Dot */}
                            <View style={styles.timelineDotContainer}>
                              <View style={[styles.timelineDot, { 
                                backgroundColor: showGenerated ? colors.accent : colors.primary,
                                borderColor: colors.card,
                              }]}>
                                <Text style={styles.timelineDotText}>{day.day}</Text>
                              </View>
                            </View>

                            {/* Day Card */}
                            <View style={styles.dayCardWrapper}>
                              <TouchableOpacity 
                                style={[styles.dayCard, { backgroundColor: colors.card }, shadows.md]}
                                activeOpacity={0.95}
                              >
                                {/* Card Header with Gradient */}
                                <LinearGradient
                                  colors={[
                                    showGenerated ? colors.accent : colors.primary,
                                    showGenerated ? colors.accent + 'DD' : colors.primary + 'DD'
                                  ]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.dayCardHeader}
                                >
                                  <View style={styles.dayCardHeaderContent}>
                                    <View style={styles.dayNumberBadge}>
                                      <Text style={styles.dayNumberText}>DAY {day.day}</Text>
                                    </View>
                                    <Text style={styles.dayCardTitle} numberOfLines={2}>
                                      {day.title || `Day ${day.day} Activities`}
                                    </Text>
                                  </View>
                                  {day.aiGenerated && (
                                    <View style={styles.aiGeneratedBadge}>
                                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                                    </View>
                                  )}
                                </LinearGradient>

                                {/* Activities Content */}
                                <View style={styles.dayCardContent}>
                                  <View style={styles.activitiesSection}>
                                    <View style={styles.activitiesList}>
                                      {day.activities.split('\n').filter(Boolean).slice(0, 5).map((activity, actIdx) => (
                                        <View key={actIdx} style={styles.activityRow}>
                                          <View style={[styles.activityDot, { backgroundColor: showGenerated ? colors.accent : colors.primary }]} />
                                          <Text style={[styles.activityText, { color: colors.text }]} numberOfLines={2}>
                                            {activity.replace('•', '').trim()}
                                          </Text>
                                        </View>
                                      ))}
                                      {day.activities.split('\n').filter(Boolean).length > 5 && (
                                        <Text style={[styles.moreActivitiesText, { color: colors.textSecondary }]}>
                                          +{day.activities.split('\n').filter(Boolean).length - 5} more activities
                                        </Text>
                                      )}
                                    </View>
                                  </View>

                                  {/* Budget Footer */}
                                  {day.budget > 0 && (
                                    <View style={[styles.budgetFooter, { borderTopColor: colors.border }]}>
                                      <View style={styles.budgetInfo}>
                                        <Ionicons name="wallet" size={18} color={colors.primary} />
                                        <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>
                                          Estimated Budget
                                        </Text>
                                      </View>
                                      <View style={[styles.budgetChip, { backgroundColor: colors.primary + '15' }]}>
                                        <Text style={[styles.budgetAmount, { color: colors.primary }]}>
                                          NPR {(day.budget / 1000).toFixed(1)}k
                                        </Text>
                                      </View>
                                    </View>
                                  )}
                                </View>

                                {/* Expand Indicator */}
                                <View style={styles.expandIndicator}>
                                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Total Budget Summary Card */}
                      {showGenerated && generatedItinerary && (
                        <View style={[styles.totalBudgetCard, shadows.lg]}>
                          <LinearGradient
                            colors={['#FF6B6B', '#FF8E53']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.totalBudgetGradient}
                          >
                            <View style={styles.totalBudgetIcon}>
                              <Ionicons name="stats-chart" size={32} color="#FFFFFF" />
                            </View>
                            <View style={styles.totalBudgetContent}>
                              <Text style={styles.totalBudgetLabel}>Total Trip Budget</Text>
                              <Text style={styles.totalBudgetAmount}>
                                NPR {generatedItinerary.reduce((sum, day) => sum + (day.budget || 0), 0).toLocaleString()}
                              </Text>
                              <View style={styles.budgetBreakdown}>
                                <View style={styles.breakdownItem}>
                                  <Ionicons name="airplane" size={14} color="rgba(255,255,255,0.9)" />
                                  <Text style={styles.breakdownText}>Travel</Text>
                                </View>
                                <View style={styles.breakdownDivider} />
                                <View style={styles.breakdownItem}>
                                  <Ionicons name="bed" size={14} color="rgba(255,255,255,0.9)" />
                                  <Text style={styles.breakdownText}>Stay</Text>
                                </View>
                                <View style={styles.breakdownDivider} />
                                <View style={styles.breakdownItem}>
                                  <Ionicons name="restaurant" size={14} color="rgba(255,255,255,0.9)" />
                                  <Text style={styles.breakdownText}>Food</Text>
                                </View>
                                <View style={styles.breakdownDivider} />
                                <View style={styles.breakdownItem}>
                                  <Ionicons name="bicycle" size={14} color="rgba(255,255,255,0.9)" />
                                  <Text style={styles.breakdownText}>Activities</Text>
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                      )}
                    </>
                  );
                } else if (!generatedItinerary) {
                  return (
                    <View style={styles.emptyStateContainer}>
                      <View style={[styles.emptyStateCircle, { backgroundColor: colors.primary + '10' }]}>
                        <Ionicons name="map-outline" size={48} color={colors.primary} />
                      </View>
                      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                        No Itinerary Yet
                      </Text>
                      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                        Generate an AI-powered itinerary based on{'\n'}your location and preferences
                      </Text>
                      <TouchableOpacity 
                        style={[styles.emptyStateCTA, { backgroundColor: colors.primary }]}
                        onPress={generateSmartItinerary}
                        disabled={generatingItinerary || !userLocation}
                      >
                        <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                        <Text style={styles.emptyStateCTAText}>Generate Now</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
              })()}
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
  // Route Section
  distanceCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  distanceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  distanceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceInfo: {
    flex: 1,
  },
  distanceValue: {
    fontSize: 42,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  distanceLabel: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  estimateText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationDetails: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  locationDetailText: {
    flex: 1,
  },
  locationDetailLabel: {
    fontSize: FONT_SIZES.xs,
    marginBottom: 4,
  },
  locationDetailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  mapContainer: {
    height: 400,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    gap: SPACING.sm,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLegend: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  mapLegendTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: 4,
  },
  mapLegendText: {
    fontSize: FONT_SIZES.xs,
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.3,
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
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
  emptyVlogSubtext: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    textAlign: 'center',
    opacity: 0.7,
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
  // AI Itinerary Generation
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  infoBoxText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  toggleButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  aiLabelText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  budgetSummary: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.lg,
  },
  budgetSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  budgetSummaryLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  budgetSummaryValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  budgetSummaryNote: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  // Premium Itinerary Timeline Styles
  aiPowerBanner: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  aiPowerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  aiPowerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPowerContent: {
    flex: 1,
  },
  aiPowerTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: 4,
  },
  aiPowerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
  },
  tripStatsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  tripStatCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tripStatValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginTop: 4,
  },
  tripStatLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineContainer: {
    marginTop: SPACING.md,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 40,
    marginBottom: SPACING.xl,
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: '100%',
  },
  timelineDotContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  timelineDotText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  dayCardWrapper: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  dayCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  dayCardHeaderContent: {
    flex: 1,
  },
  dayNumberBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.xs,
  },
  dayNumberText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
  },
  dayCardTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 26,
  },
  aiGeneratedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardContent: {
    backgroundColor: 'transparent',
  },
  activitiesSection: {
    padding: SPACING.lg,
  },
  activitiesList: {
    gap: SPACING.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  activityText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  moreActivitiesText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    marginLeft: 14,
    marginTop: SPACING.xs,
  },
  budgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  budgetLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  budgetChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  budgetAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  expandIndicator: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  totalBudgetCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  totalBudgetGradient: {
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  totalBudgetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBudgetContent: {
    flex: 1,
  },
  totalBudgetLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalBudgetAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.md,
  },
  budgetBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breakdownText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  breakdownDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 3,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  emptyStateCTAText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default PostDetailsScreen;
