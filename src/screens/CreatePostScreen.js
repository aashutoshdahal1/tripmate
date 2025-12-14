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
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { pickMedia, uploadMediaToCloudinary, createPost } from '../services/postService';
import LocationMap3D from '../components/LocationMap3D';

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
    days: '',
    budget: '',
    interests: [],
  });

  const videoRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
        
        // Move to next step
        setStep(2);
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

  // Handle create post
  const handleCreatePost = async () => {
    try {
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

      setUploading(true);

      // Upload media to Cloudinary first
      const cloudinaryResult = await uploadMediaToCloudinary(
        mediaAsset.uri,
        mediaAsset.type,
        (progress) => setUploadProgress(progress)
      );

      // Prepare post data
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
          capturedAt: mediaAsset.metadata?.exif?.dateTime || new Date().toISOString(),
          device: mediaAsset.metadata?.exif?.make,
          camera: mediaAsset.metadata?.exif?.model,
        },
        tripDetails: {
          duration: parseInt(formData.days),
          budget: formData.budget ? {
            amount: parseInt(formData.budget),
            currency: 'NPR',
          } : undefined,
          interests: formData.interests,
        },
      };

      console.log('📝 CREATING POST...', postData);

      // Create post
      const post = await createPost(postData, token);

      console.log('✅ POST CREATED:', post._id);

      setUploading(false);
      setStep(4); // Success step

    } catch (error) {
      console.error('❌ CREATE POST ERROR:', error);
      setUploading(false);
      Alert.alert('Error', error.message || 'Failed to create post');
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
>
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
              resizeMode="cover"
              isLooping
            />
          ) : (
            <Image source={{ uri: mediaAsset.uri }} style={styles.mediaPreview} />
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

        {/* Days & Budget */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfInput]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Days *</Text>
            <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="3"
                placeholderTextColor={colors.textLight}
                value={formData.days}
                onChangeText={(text) => setFormData(prev => ({ ...prev, days: text }))}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          <View style={[styles.inputContainer, styles.halfInput]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Budget (NPR)</Text>
            <View style={[styles.inputGroup, { backgroundColor: colors.card }]}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="15000"
                placeholderTextColor={colors.textLight}
                value={formData.budget}
                onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>
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
            (!formData.title.trim() || !formData.days) && { opacity: 0.5 },
          ]}
          onPress={handleCreatePost}
          disabled={!formData.title.trim() || !formData.days || uploading}
        >
          <LinearGradient
            colors={[colors.accent, colors.accent]}
            style={styles.gradientButton}
          >
            {uploading ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.continueButtonText}>
                  {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : 'Creating...'}
                </Text>
              </>
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
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={[styles.doneButtonText, { color: colors.text }]}>
            View Feed
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
            <Text style={styles.continueButtonText}>My Profile</Text>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(step / 3) * 100}%`,
                },
              ]}
            />
          </View>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && renderUploadStep()}
          {step === 2 && renderLocationStep()}
          {step === 3 && renderDetailsStep()}
          {step === 4 && renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 400,
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
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default CreatePostScreen;
