import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { pickMedia, uploadMediaToCloudinary, createPost } from '../services/postService';
import LocationMap3D from '../components/LocationMap3D';
import WaterWaveLoader from '../components/WaterWaveLoader';

const { width } = Dimensions.get('window');

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const { user, token } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Location, 3: Details, 4: Success
  const [mediaAsset, setMediaAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudinaryData, setCloudinaryData] = useState(null);
  const [mediaType, setMediaType] = useState('both'); // 'video', 'image', or 'both'
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: {
      name: '',
      coordinates: null,
      address: '',
    },
    tripType: '', // 'short' or 'long'
    days: '',
    budgetBreakdown: {
      accommodation: '',
      food: '',
      transport: '',
      activities: '',
    },
    interests: [],
    vlogs: [], // Array of {uri, type, thumbnail, duration, title}
    itinerary: [], // Array of {day, title, activities}
  });

  const [uploadingVlog, setUploadingVlog] = useState(false);
  const [vlogProgress, setVlogProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Publishing...');

  const videoRef = useRef(null);
  const scrollRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loadingMessageInterval = useRef(null);

  const interestOptions = [
    { id: 'adventure', label: 'Adventure', icon: 'flame', color: '#FF6B6B' },
    { id: 'nature', label: 'Nature', icon: 'leaf', color: '#51CF66' },
    { id: 'culture', label: 'Culture', icon: 'library', color: '#9775FA' },
    { id: 'food', label: 'Food', icon: 'restaurant', color: '#FF922B' },
    { id: 'relaxation', label: 'Relaxation', icon: 'sunny', color: '#FFD43B' },
    { id: 'photography', label: 'Photography', icon: 'camera', color: '#339AF0' },
  ];

  // Animate step transitions
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  // Handle media selection
  const handleSelectMedia = async (type = 'both') => {
    try {
      console.log('🎬 SELECTING MEDIA...');
      
      const result = await pickMedia(type);
      
      if (result) {
        setMediaAsset(result);
        console.log('✅ MEDIA SELECTED');
        
        // Auto-fill location if available and valid
        if (result.location && 
            result.location.latitude !== null && 
            result.location.longitude !== null &&
            !isNaN(result.location.latitude) &&
            !isNaN(result.location.longitude)) {
          setFormData(prev => ({
            ...prev,
            location: {
              name: result.location.address?.formatted || result.location.address?.city || '',
              coordinates: {
                latitude: result.location.latitude,
                longitude: result.location.longitude,
              },
              address: result.location.address?.formatted || '',
            },
          }));
        }
        
        // Scroll to bottom to show Change/Continue buttons
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (error) {
      console.error('❌ SELECT MEDIA ERROR:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  };

  // Handle upload to Cloudinary
  const handleUploadMedia = async () => {
    if (!mediaAsset) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const cloudinaryResult = await uploadMediaToCloudinary(
        mediaAsset.uri,
        mediaAsset.type,
        (progress) => setUploadProgress(progress)
      );

      setCloudinaryData(cloudinaryResult);
      console.log('✅ UPLOAD COMPLETE');
      
      // Move to location step
      setStep(2);
    } catch (error) {
      console.error('❌ UPLOAD ERROR:', error);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Toggle interest
  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  // Handle vlog selection and upload
  const handleAddVlog = async () => {
    // Show options: Record or Select from library
    Alert.alert(
      'Add Vlog',
      'Choose how to add your video',
      [
        {
          text: 'Record New Video',
          onPress: () => handleRecordVlog(),
        },
        {
          text: 'Select from Library',
          onPress: () => handleSelectVlog(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Record video with camera (automatically compressed)
  const handleRecordVlog = async () => {
    try {
      setUploadingVlog(true);
      
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to record videos');
        return;
      }

      // Launch camera to record video
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 60, // 60 seconds max
        quality: 0.5, // 50% quality for smaller files
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
        videoExportPreset: ImagePicker.VideoExportPreset.LowQuality, // Aggressive compression
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('🎥 VIDEO RECORDED:', {
          uri: asset.uri,
          duration: asset.duration,
          fileSize: asset.fileSize,
        });

        // Upload to Cloudinary
        const cloudinaryResult = await uploadMediaToCloudinary(
          asset.uri,
          'video',
          (progress) => setVlogProgress(progress)
        );

        // Add to vlogs array
        const newVlog = {
          uri: cloudinaryResult.url,
          thumbnail: cloudinaryResult.thumbnail,
          duration: cloudinaryResult.duration,
          publicId: cloudinaryResult.publicId,
          title: '',
        };

        setFormData(prev => ({
          ...prev,
          vlogs: [...prev.vlogs, newVlog],
        }));

        Alert.alert('Success', 'Vlog added successfully!');
      }
    } catch (error) {
      console.error('❌ VIDEO RECORDING ERROR:', error);
      Alert.alert('Error', error.message || 'Failed to record video. Please try again.');
    } finally {
      setUploadingVlog(false);
      setVlogProgress(0);
    }
  };

  // Select video from library
  const handleSelectVlog = async () => {
    try {
      setUploadingVlog(true);
      const result = await pickMedia('video');
      
      if (result) {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadMediaToCloudinary(
          result.uri,
          result.type,
          (progress) => setVlogProgress(progress)
        );

        // Add to vlogs array
        const newVlog = {
          uri: cloudinaryResult.url,
          thumbnail: cloudinaryResult.thumbnail,
          duration: cloudinaryResult.duration,
          publicId: cloudinaryResult.publicId,
          title: '', // User can edit later
        };

        setFormData(prev => ({
          ...prev,
          vlogs: [...prev.vlogs, newVlog],
        }));

        Alert.alert('Success', 'Vlog added successfully!');
      }
    } catch (error) {
      console.error('❌ VLOG UPLOAD ERROR:', error);
      
      // Show specific error message if it's a file size issue
      const errorMessage = error.message || 'Failed to upload vlog. Please try again.';
      const isFileSizeError = errorMessage.includes('too large') || errorMessage.includes('Too large');
      
      Alert.alert(
        isFileSizeError ? 'Video Too Large' : 'Upload Error',
        errorMessage
      );
    } finally {
      setUploadingVlog(false);
      setVlogProgress(0);
    }
  };

  // Remove vlog from array
  const handleRemoveVlog = (index) => {
    Alert.alert(
      'Remove Vlog',
      'Are you sure you want to remove this vlog?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              vlogs: prev.vlogs.filter((_, i) => i !== index),
            }));
          },
        },
      ]
    );
  };

  // Update vlog title
  const handleUpdateVlogTitle = (index, title) => {
    setFormData(prev => ({
      ...prev,
      vlogs: prev.vlogs.map((vlog, i) => 
        i === index ? { ...vlog, title } : vlog
      ),
    }));
  };

  // Add itinerary day
  const handleAddItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: '',
      activities: '',
    };
    
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, newDay],
    }));
  };

  // Update itinerary day
  const handleUpdateItinerary = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Remove itinerary day
  const handleRemoveItineraryDay = (index) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 })), // Re-index days
    }));
  };

  // Handle create post
  const handleCreatePost = async () => {
    try {
      // Check if user is authenticated
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to create a post');
        navigation.navigate('GetStarted');
        return;
      }

      if (!user) {
        Alert.alert('User Not Found', 'Please log in again');
        navigation.navigate('GetStarted');
        return;
      }

      console.log('🔐 USER INFO:', { userId: user._id, userName: user.name });
      console.log('🔑 TOKEN EXISTS:', !!token);
      console.log('🔑 TOKEN LENGTH:', token?.length);

      // Validation
      if (!formData.title.trim()) {
        Alert.alert('Missing Info', 'Please add a title for your trip');
        return;
      }

      if (!formData.location.name.trim()) {
        Alert.alert('Missing Info', 'Please add a location');
        return;
      }

      if (!formData.days || parseInt(formData.days) < 1) {
        Alert.alert('Missing Info', 'Please add trip duration');
        return;
      }

      if (!formData.tripType) {
        Alert.alert('Missing Info', 'Please select a trip type');
        return;
      }

      if (!formData.budgetBreakdown.transport || parseInt(formData.budgetBreakdown.transport) < 1) {
        Alert.alert('Missing Info', 'Please add at least the transport cost');
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      
      // Fun loading messages
      const messages = [
        '🎒 Packing your memories...',
        '✈️ Boarding the upload flight...',
        '📸 Polishing your photos...',
        '🗺️ Mapping your journey...',
        '🌟 Adding sparkle to your story...',
        '🚀 Almost there...',
        '🎉 Finalizing your adventure...',
      ];
      
      let messageIndex = 0;
      setLoadingMessage(messages[0]);
      
      // Rotate messages every 1.5 seconds
      loadingMessageInterval.current = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 1500);

      // Upload media to Cloudinary first
      const cloudinaryResult = await uploadMediaToCloudinary(
        mediaAsset.uri,
        mediaAsset.type,
        (progress) => setUploadProgress(progress)
      );

      // Prepare post data
      const totalBudget = 
        (parseInt(formData.budgetBreakdown.accommodation) || 0) +
        (parseInt(formData.budgetBreakdown.food) || 0) +
        (parseInt(formData.budgetBreakdown.transport) || 0) +
        (parseInt(formData.budgetBreakdown.activities) || 0);

      // Convert EXIF date format (2025:11:15 10:21:35) to ISO date
      const convertExifDateToISO = (exifDate) => {
        if (!exifDate) return new Date().toISOString();
        
        try {
          // EXIF format: "2025:11:15 10:21:35"
          // Replace colons in date with hyphens
          const cleanDate = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
          const date = new Date(cleanDate);
          
          // Check if valid date
          if (isNaN(date.getTime())) {
            console.warn('⚠️ Invalid EXIF date, using current date');
            return new Date().toISOString();
          }
          
          return date.toISOString();
        } catch (error) {
          console.error('❌ Date conversion error:', error);
          return new Date().toISOString();
        }
      };

      const postData = {
        title: formData.title,
        description: formData.description,
        location: {
          name: formData.location.name,
          coordinates: formData.location.coordinates || undefined,
          address: formData.location.address,
        },
        media: {
          type: mediaAsset.type,
          url: cloudinaryResult.url,
          thumbnail: cloudinaryResult.thumbnail,
          publicId: cloudinaryResult.publicId,
          duration: cloudinaryResult.duration,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
        },
        metadata: {
          capturedAt: convertExifDateToISO(mediaAsset.metadata?.exif?.dateTime),
          device: mediaAsset.metadata?.exif?.make,
          camera: mediaAsset.metadata?.exif?.model,
        },
        tripDetails: {
          duration: parseInt(formData.days),
          tripType: formData.tripType,
          budget: totalBudget > 0 ? {
            amount: totalBudget,
            currency: 'NPR',
            breakdown: {
              accommodation: parseInt(formData.budgetBreakdown.accommodation) || 0,
              food: parseInt(formData.budgetBreakdown.food) || 0,
              transport: parseInt(formData.budgetBreakdown.transport) || 0,
              activities: parseInt(formData.budgetBreakdown.activities) || 0,
            },
          } : undefined,
          interests: formData.interests,
          itinerary: formData.itinerary.length > 0 ? formData.itinerary : undefined,
        },
        vlogs: formData.vlogs.length > 0 ? formData.vlogs : undefined,
      };

      console.log('📝 CREATING POST...');
      console.log('📹 VLOGS IN FORM DATA:', formData.vlogs);
      console.log('📹 VLOGS COUNT:', formData.vlogs.length);
      console.log('📹 POST DATA VLOGS:', postData.vlogs);
      console.log('📦 FULL POST DATA:', JSON.stringify(postData, null, 2));

      // Create post
      const post = await createPost(postData, token);

      console.log('✅ POST CREATED:', post._id);

      // Clear loading message interval
      if (loadingMessageInterval.current) {
        clearInterval(loadingMessageInterval.current);
        loadingMessageInterval.current = null;
      }

      setUploading(false);
      setLoadingMessage('Publishing...');
      
      // Show success message
      Alert.alert(
        '🎉 Post Created!',
        'Your trip has been shared with the TripMate community',
        [
          {
            text: 'View Profile',
            onPress: () => navigation.navigate('ProfileTab')
          },
          {
            text: 'Create Another',
            style: 'default'
          }
        ]
      );
      
      // Reset form and go back to step 1
      setMediaAsset(null);
      setCloudinaryData(null);
      setFormData({
        title: '',
        description: '',
        location: {
          name: '',
          coordinates: null,
          address: '',
        },
        tripType: '',
        days: '',
        budgetBreakdown: {
          accommodation: '',
          food: '',
          transport: '',
          activities: '',
        },
        interests: [],
        vlogs: [],
        itinerary: [],
      });
      setStep(1);

    } catch (error) {
      console.error('❌ CREATE POST ERROR:', error);
      console.error('❌ ERROR DETAILS:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Clear loading message interval
      if (loadingMessageInterval.current) {
        clearInterval(loadingMessageInterval.current);
        loadingMessageInterval.current = null;
      }
      
      setUploading(false);
      setLoadingMessage('Publishing...');
      
      // Handle specific error cases
      if (error.message && error.message.includes('Not authorized')) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('GetStarted')
            }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
      }
    }
  };

  // Render Step 1: Upload Media
  const renderUploadStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {!mediaAsset && (
        <View style={styles.stepHeader}>
          <View style={[styles.stepIconContainer, { backgroundColor: colors.primaryAlpha }]}>
            <Ionicons name="videocam" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Upload Your Trip
          </Text>
          <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
            Select a video or photo from your gallery
          </Text>
        </View>
      )}

      {!mediaAsset ? (
        <View>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primaryAlpha + '10',
              },
            ]}
            onPress={() => handleSelectMedia('both')}
            activeOpacity={0.7}
          >
            <View style={[styles.uploadIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.uploadText, { color: colors.text }]}>
              Tap to Select Media
            </Text>
            <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
              Video (max 60s) or Photo
            </Text>
            <View style={styles.uploadFeatures}>
              <View style={styles.uploadFeature}>
                <Ionicons name="location" size={14} color={colors.accent} />
                <Text style={[styles.uploadFeatureText, { color: colors.textSecondary }]}>
                  Auto-detect location
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Quick Action Buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={() => handleSelectMedia('video')}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam" size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Video Only
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card }]}
              onPress={() => handleSelectMedia('image')}
              activeOpacity={0.7}
            >
              <Ionicons name="image" size={24} color={colors.accent} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Photo Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mediaPreviewContainer}>
          {mediaAsset.type === 'video' ? (
            <Video
              ref={videoRef}
              source={{ uri: mediaAsset.uri }}
              style={styles.mediaPreview}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          ) : (
            <Image 
              source={{ uri: mediaAsset.uri }} 
              style={styles.mediaPreview}
              resizeMode="contain"
            />
          )}
          
          {mediaAsset.location && (
            <View style={[styles.locationBadge, { backgroundColor: colors.accent }]}>
              <Ionicons name="location" size={14} color="#FFFFFF" />
              <Text style={styles.locationBadgeText}>
                {mediaAsset.location.address?.formatted || 'Location detected'}
              </Text>
            </View>
          )}

          <View style={styles.mediaActions}>
            <TouchableOpacity
              style={[styles.mediaActionButton, { backgroundColor: colors.card }]}
              onPress={handleSelectMedia}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
              <Text style={[styles.mediaActionText, { color: colors.text }]}>
                Change
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaActionButton, styles.continueButtonMedia, { backgroundColor: colors.primary }]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.continueButtonMediaText}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );

  // Render Step 2: Location
  const renderLocationStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: colors.accentAlpha }]}>
          <Ionicons name="location" size={36} color={colors.accent} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Location Details
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {formData.location.name ? 'Confirm or edit the location' : 'Where did you go?'}
        </Text>
      </View>

      {/* 3D Map Preview */}
      {formData.location.coordinates && 
       formData.location.coordinates.latitude !== null && 
       formData.location.coordinates.longitude !== null && (
        <View style={styles.mapContainer}>
          <LocationMap3D 
            location={{
              latitude: formData.location.coordinates.latitude,
              longitude: formData.location.coordinates.longitude,
              address: {
                formatted: formData.location.name || formData.location.address,
              },
            }}
            height={300}
            showControls={true}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Location *</Text>
        <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g., Pokhara, Nepal"
            placeholderTextColor={colors.textLight}
            value={formData.location.name}
            onChangeText={(text) => setFormData(prev => ({
              ...prev,
              location: { ...prev.location, name: text }
            }))}
          />
        </View>
        {formData.location.coordinates && 
         formData.location.coordinates.latitude !== null && 
         formData.location.coordinates.longitude !== null && (
          <Text style={[styles.coordinatesText, { color: colors.textLight }]}>
            {`📍 ${formData.location.coordinates.latitude.toFixed(6)}, ${formData.location.coordinates.longitude.toFixed(6)}`}
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !formData.location.name.trim() && { opacity: 0.5 },
          ]}
          onPress={() => formData.location.name.trim() && setStep(3)}
          disabled={!formData.location.name.trim()}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            style={styles.gradientButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render Step 3: Trip Details
  const renderDetailsStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: '#FF922B20' }]}>
          <Ionicons name="information-circle" size={36} color="#FF922B" />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          Trip Details
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Tell us about your experience
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Ionicons name="text-outline" size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="e.g., Amazing Trek to Annapurna"
              placeholderTextColor={colors.textLight}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              maxLength={100}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
          <View style={[styles.inputGroup, styles.textArea, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, styles.textAreaInput, { color: colors.text }]}
              placeholder="Share your experience..."
              placeholderTextColor={colors.textLight}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {/* Trip Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Trip Type *</Text>
          <View style={styles.tripTypeContainer}>
            <TouchableOpacity
              style={[
                styles.tripTypeCard,
                { 
                  backgroundColor: formData.tripType === 'short' ? colors.primary + '20' : colors.card,
                  borderColor: formData.tripType === 'short' ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormData(prev => ({ ...prev, tripType: 'short' }))}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tripTypeIcon,
                { backgroundColor: formData.tripType === 'short' ? colors.primary : colors.border }
              ]}>
                <Ionicons 
                  name="flash" 
                  size={24} 
                  color={formData.tripType === 'short' ? '#FFFFFF' : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.tripTypeTitle,
                { color: formData.tripType === 'short' ? colors.primary : colors.text }
              ]}>
                Short Trip
              </Text>
              <Text style={[styles.tripTypeSubtitle, { color: colors.textSecondary }]}>
                1-3 days • Quick getaway
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tripTypeCard,
                { 
                  backgroundColor: formData.tripType === 'long' ? colors.accent + '20' : colors.card,
                  borderColor: formData.tripType === 'long' ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setFormData(prev => ({ ...prev, tripType: 'long' }))}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tripTypeIcon,
                { backgroundColor: formData.tripType === 'long' ? colors.accent : colors.border }
              ]}>
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color={formData.tripType === 'long' ? '#FFFFFF' : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.tripTypeTitle,
                { color: formData.tripType === 'long' ? colors.accent : colors.text }
              ]}>
                Long Trip
              </Text>
              <Text style={[styles.tripTypeSubtitle, { color: colors.textSecondary }]}>
                4+ days • Extended journey
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (Days) *</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={formData.tripType === 'short' ? '1-3' : '4+'}
              placeholderTextColor={colors.textLight}
              value={formData.days}
              onChangeText={(text) => setFormData(prev => ({ ...prev, days: text }))}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        {/* Budget Breakdown */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Ionicons name="wallet-outline" size={20} color={colors.accent} />
            <Text style={[styles.sectionLabel, { color: colors.text, marginBottom: 0, marginLeft: 0 }]}>
              Budget Breakdown (NPR)
            </Text>
          </View>
          <Text style={[styles.budgetHint, { color: colors.textSecondary }]}>
            Add only what you spent. Leave blank if not applicable.
          </Text>

          {/* Accommodation */}
          <View style={styles.budgetItemContainer}>
            <View style={[styles.budgetItemIcon, { backgroundColor: '#2679FF20' }]}>
              <Ionicons name="bed-outline" size={20} color="#2679FF" />
            </View>
            <View style={styles.budgetItemInput}>
              <Text style={[styles.budgetItemLabel, { color: colors.text }]}>Accommodation</Text>
              <View style={[styles.inputGroup, styles.budgetInput, { backgroundColor: colors.card }]}>
                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  value={formData.budgetBreakdown.accommodation}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    budgetBreakdown: { ...prev.budgetBreakdown, accommodation: text }
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Food */}
          <View style={styles.budgetItemContainer}>
            <View style={[styles.budgetItemIcon, { backgroundColor: '#00C89620' }]}>
              <Ionicons name="restaurant-outline" size={20} color="#00C896" />
            </View>
            <View style={styles.budgetItemInput}>
              <Text style={[styles.budgetItemLabel, { color: colors.text }]}>Food & Drinks</Text>
              <View style={[styles.inputGroup, styles.budgetInput, { backgroundColor: colors.card }]}>
                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  value={formData.budgetBreakdown.food}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    budgetBreakdown: { ...prev.budgetBreakdown, food: text }
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Transport */}
          <View style={styles.budgetItemContainer}>
            <View style={[styles.budgetItemIcon, { backgroundColor: '#FF950020' }]}>
              <Ionicons name="car-outline" size={20} color="#FF9500" />
            </View>
            <View style={styles.budgetItemInput}>
              <Text style={[styles.budgetItemLabel, { color: colors.text }]}>Transport *</Text>
              <View style={[styles.inputGroup, styles.budgetInput, { backgroundColor: colors.card }]}>
                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Required"
                  placeholderTextColor={colors.textLight}
                  value={formData.budgetBreakdown.transport}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    budgetBreakdown: { ...prev.budgetBreakdown, transport: text }
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Activities */}
          <View style={styles.budgetItemContainer}>
            <View style={[styles.budgetItemIcon, { backgroundColor: '#FF3B3020' }]}>
              <Ionicons name="bicycle-outline" size={20} color="#FF3B30" />
            </View>
            <View style={styles.budgetItemInput}>
              <Text style={[styles.budgetItemLabel, { color: colors.text }]}>Activities</Text>
              <View style={[styles.inputGroup, styles.budgetInput, { backgroundColor: colors.card }]}>
                <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  value={formData.budgetBreakdown.activities}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    budgetBreakdown: { ...prev.budgetBreakdown, activities: text }
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Total Budget Display */}
          {(() => {
            const total = 
              (parseInt(formData.budgetBreakdown.accommodation) || 0) +
              (parseInt(formData.budgetBreakdown.food) || 0) +
              (parseInt(formData.budgetBreakdown.transport) || 0) +
              (parseInt(formData.budgetBreakdown.activities) || 0);
            
            return total > 0 ? (
              <View style={[styles.totalBudgetCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
                <Text style={[styles.totalBudgetLabel, { color: colors.textSecondary }]}>
                  Total Budget
                </Text>
                <Text style={[styles.totalBudgetAmount, { color: colors.accent }]}>
                  NPR {total.toLocaleString()}
                </Text>
              </View>
            ) : null;
          })()}
        </View>

        {/* Interests */}
        <View style={styles.interestsSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Trip Interests
          </Text>
          <View style={styles.interestsGrid}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestChip,
                  {
                    borderColor: formData.interests.includes(interest.id)
                      ? interest.color
                      : colors.border,
                    backgroundColor: formData.interests.includes(interest.id)
                      ? interest.color + '20'
                      : colors.card,
                  },
                ]}
                onPress={() => toggleInterest(interest.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.interestIconContainer,
                    { backgroundColor: interest.color + '30' },
                  ]}
                >
                  <Ionicons name={interest.icon} size={12} color={interest.color} />
                </View>
                <Text
                  style={[
                    styles.interestText,
                    {
                      color: formData.interests.includes(interest.id)
                        ? interest.color
                        : colors.text,
                    },
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vlogs Section (Optional) */}
        <View style={styles.vlogsSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <Ionicons name="play-circle" size={20} color={colors.accent} />
              <Text style={[styles.sectionLabel, { marginBottom: 0, marginLeft: 0, color: colors.text }]}>
                Trip Vlogs
              </Text>
            </View>
            <View style={[styles.optionalBadge, { backgroundColor: colors.primaryAlpha }]}>
              <Text style={[styles.optionalBadgeText, { color: colors.primary }]}>Optional</Text>
            </View>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Add video vlogs to showcase your trip moments
          </Text>

          {formData.vlogs.length === 0 ? (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleAddVlog}
              disabled={uploadingVlog}
              activeOpacity={0.7}
            >
              {uploadingVlog ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
                    {vlogProgress > 0 ? `Uploading ${Math.round(vlogProgress)}%` : 'Processing...'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  <Text style={[styles.addButtonText, { color: colors.text }]}>
                    Add First Vlog
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {formData.vlogs.map((vlog, index) => (
                <View key={index} style={[styles.vlogItem, { backgroundColor: colors.card }]}>
                  <Image 
                    source={{ uri: vlog.thumbnail || vlog.uri }} 
                    style={styles.vlogThumbnailSmall}
                  />
                  <View style={styles.vlogItemContent}>
                    <TextInput
                      style={[styles.vlogTitleInput, { color: colors.text }]}
                      placeholder={`Vlog ${index + 1} title...`}
                      placeholderTextColor={colors.textLight}
                      value={vlog.title}
                      onChangeText={(text) => handleUpdateVlogTitle(index, text)}
                      maxLength={50}
                    />
                    {vlog.duration && (
                      <Text style={[styles.vlogDuration, { color: colors.textSecondary }]}>
                        {Math.floor(vlog.duration / 60)}:{String(Math.floor(vlog.duration % 60)).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveVlog(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.addMoreButton, { backgroundColor: colors.primaryAlpha }]}
                onPress={handleAddVlog}
                disabled={uploadingVlog}
                activeOpacity={0.7}
              >
                {uploadingVlog ? (
                  <>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.addMoreButtonText, { color: colors.primary }]}>
                      {vlogProgress > 0 ? `${Math.round(vlogProgress)}%` : 'Processing...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add" size={20} color={colors.primary} />
                    <Text style={[styles.addMoreButtonText, { color: colors.primary }]}>
                      Add Another Vlog
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Itinerary Section (Optional) */}
        <View style={styles.itinerarySection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
              <Ionicons name="list" size={20} color="#FF9500" />
              <Text style={[styles.sectionLabel, { marginBottom: 0, marginLeft: 0, color: colors.text }]}>
                Trip Itinerary
              </Text>
            </View>
            <View style={[styles.optionalBadge, { backgroundColor: colors.primaryAlpha }]}>
              <Text style={[styles.optionalBadgeText, { color: colors.primary }]}>Optional</Text>
            </View>
          </View>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            Share your day-by-day plan
          </Text>

          {formData.itinerary.length === 0 ? (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleAddItineraryDay}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FF9500" />
              <Text style={[styles.addButtonText, { color: colors.text }]}>
                Add Day 1
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              {formData.itinerary.map((item, index) => (
                <View key={index} style={[styles.itineraryItem, { backgroundColor: colors.card }]}>
                  <View style={styles.itineraryHeader}>
                    <View style={[styles.dayBadgeSmall, { backgroundColor: '#FF9500' }]}>
                      <Text style={styles.dayBadgeSmallText}>Day {item.day}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItineraryDay(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    style={[styles.itineraryTitleInput, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Day title (e.g., Arrival & Exploration)"
                    placeholderTextColor={colors.textLight}
                    value={item.title}
                    onChangeText={(text) => handleUpdateItinerary(index, 'title', text)}
                    maxLength={100}
                  />
                  
                  <TextInput
                    style={[styles.itineraryActivitiesInput, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Activities for this day..."
                    placeholderTextColor={colors.textLight}
                    value={item.activities}
                    onChangeText={(text) => handleUpdateItinerary(index, 'activities', text)}
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                  />
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.addMoreButton, { backgroundColor: '#FF950020' }]}
                onPress={handleAddItineraryDay}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#FF9500" />
                <Text style={[styles.addMoreButtonText, { color: '#FF9500' }]}>
                  Add Day {formData.itinerary.length + 1}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => setStep(2)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!formData.title.trim() || !formData.days || !formData.tripType || !formData.budgetBreakdown.transport) && { opacity: 0.5 },
          ]}
          onPress={handleCreatePost}
          disabled={!formData.title.trim() || !formData.days || !formData.tripType || !formData.budgetBreakdown.transport || uploading}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent]}
            style={styles.gradientButton}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <Text style={styles.continueButtonText}>
                  {loadingMessage}
                </Text>
                <Text style={[styles.uploadProgressText, { fontSize: FONT_SIZES.xs }]}>
                  {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : '...'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.continueButtonText}>Publish</Text>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Render Step 4: Success
  const renderSuccessStep = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        styles.successContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: fadeAnim }],
        },
      ]}
    >
      <View style={styles.successIconContainer}>
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          style={styles.successGradient}
        >
          <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <Text style={[styles.successTitle, { color: colors.text }]}>
        Post Created!
      </Text>
      <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
        Your trip has been shared with the TripMate community
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: colors.card }]}
          onPress={() => {
            // Reset form and go back to upload step
            setMediaAsset(null);
            setCloudinaryData(null);
            setFormData({
              title: '',
              description: '',
              location: {
                name: '',
                coordinates: null,
                address: '',
              },
              tripType: '',
              days: '',
              budgetBreakdown: {
                accommodation: '',
                food: '',
                transport: '',
                activities: '',
              },
              interests: [],
              vlogs: [],
              itinerary: [],
            });
            setStep(1);
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.text} />
          <Text style={[styles.doneButtonText, { color: colors.text }]}>
            Create Another
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton]}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            style={styles.gradientButton}
          >
            <Text style={styles.continueButtonText}>View Profile</Text>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => {
          // Clear media if exists before going back
          if (mediaAsset) {
            setMediaAsset(null);
            setFormData({
              title: '',
              description: '',
              location: {
                name: '',
                coordinates: null,
                address: '',
              },
              tripType: '',
              days: '',
              budgetBreakdown: {
                accommodation: '',
                food: '',
                transport: '',
                activities: '',
              },
              interests: [],
              vlogs: [],
              itinerary: [],
            });
          } else {
            navigation.goBack();
          }
        }}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create Post
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Indicator */}
      {step < 4 && (
        <View style={styles.progressContainer}>
          <WaterWaveLoader 
            progress={(step / 3) * 100}
            height={4}
            color={colors.primary}
          />
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {`Step ${step} of 3`}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && renderUploadStep()}
          {step === 2 && renderLocationStep()}
          {step === 3 && renderDetailsStep()}
          {step === 4 && renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Upload Progress Modal */}
      {uploading && (
        <View style={[styles.uploadModal, { backgroundColor: colors.background + 'F0' }]}>
          <View style={[styles.uploadModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.uploadIconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.uploadIconGradient}
              >
                <Ionicons name="cloud-upload" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={[styles.uploadModalTitle, { color: colors.text }]}>
              {loadingMessage}
            </Text>
            
            <View style={styles.uploadProgressContainer}>
              <WaterWaveLoader 
                progress={uploadProgress}
                height={8}
                color={colors.accent}
              />
              <Text style={[styles.uploadProgressPercentage, { color: colors.accent }]}>
                {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : 'Preparing...'}
              </Text>
            </View>
            
            <Text style={[styles.uploadModalHint, { color: colors.textSecondary }]}>
              Please don't close the app
            </Text>
          </View>
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
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  uploadBox: {
    height: 300,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  uploadHint: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  uploadFeatures: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  uploadFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  uploadFeatureText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  mediaPreviewContainer: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: BORDER_RADIUS.xl,
  },
  locationBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  locationBadgeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  miniMapContainer: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  mediaActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  continueButtonMedia: {
    flex: 2,
  },
  mediaActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  continueButtonMediaText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  textArea: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  coordinatesText: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  mapContainer: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  tripTypeCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
  },
  tripTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  tripTypeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  tripTypeSubtitle: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  budgetSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  budgetHint: {
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  budgetItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  budgetItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetItemInput: {
    flex: 1,
  },
  budgetItemLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  budgetInput: {
    paddingVertical: SPACING.sm,
  },
  totalBudgetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    marginTop: SPACING.md,
  },
  totalBudgetLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  totalBudgetAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  interestsSection: {
    marginTop: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
  },
  interestIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  continueButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  successIconContainer: {
    marginBottom: SPACING.xl,
  },
  successGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    lineHeight: 22,
  },
  doneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  doneButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Vlogs Section
  vlogsSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  optionalBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  optionalBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  vlogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  vlogThumbnailSmall: {
    width: 80,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
  },
  vlogItemContent: {
    flex: 1,
  },
  vlogTitleInput: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
  },
  vlogDuration: {
    fontSize: FONT_SIZES.xs,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  addMoreButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  // Itinerary Section
  itinerarySection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  itineraryItem: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dayBadgeSmall: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  dayBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'uppercase',
  },
  itineraryTitleInput: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  itineraryActivitiesInput: {
    fontSize: FONT_SIZES.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // Upload Modal
  uploadModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  uploadModalContent: {
    width: width * 0.85,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  uploadIconContainer: {
    marginBottom: SPACING.lg,
  },
  uploadIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  uploadProgressContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  uploadProgressPercentage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  uploadModalHint: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  uploadProgressText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default CreatePostScreen;
