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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width } = Dimensions.get('window');

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    days: '',
    budget: '',
    interests: [],
    video: null,
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

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

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [step]);

  // Pulse animation for AI button
  useEffect(() => {
    if (step === 2 && !aiGenerating) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [step, aiGenerating]);

  // Success confetti animation
  useEffect(() => {
    if (step === 4) {
      Animated.sequence([
        Animated.spring(confettiAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  const interestOptions = [
    { id: 'adventure', label: 'Adventure', icon: 'flame', color: '#FF6B6B' },
    { id: 'nature', label: 'Nature', icon: 'leaf', color: '#51CF66' },
    { id: 'culture', label: 'Culture', icon: 'library', color: '#9775FA' },
    { id: 'food', label: 'Food', icon: 'restaurant', color: '#FF922B' },
    { id: 'relaxation', label: 'Relaxation', icon: 'sunny', color: '#FFD43B' },
    { id: 'photography', label: 'Photography', icon: 'camera', color: '#339AF0' },
  ];

  const toggleInterest = (id) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleGenerateWithAI = () => {
    setAiGenerating(true);
    // Simulate AI generation with progress
    setTimeout(() => {
      setAiGenerating(false);
      // Trigger slide animation for next step
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStep(3);
        slideAnim.setValue(50);
      });
    }, 2500);
  };

  const goToNextStep = (nextStep) => {
    Animated.timing(slideAnim, {
      toValue: -50,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      slideAnim.setValue(50);
    });
  };

  const goToPreviousStep = (prevStep) => {
    Animated.timing(slideAnim, {
      toValue: 50,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(prevStep);
      slideAnim.setValue(-50);
    });
  };

  const renderProgressBar = () => {
    const progress = progressAnim.interpolate({
      inputRange: [1, 4],
      outputRange: ['25%', '100%'],
    });

    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progress,
              },
            ]}
          >
            <LinearGradient
              colors={['#2679FF', '#00C896']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
        <View style={styles.stepsIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.stepDot}>
              <View
                style={[
                  styles.stepDotInner,
                  {
                    backgroundColor: step >= s ? '#00C896' : colors.border,
                    transform: [{ scale: step === s ? 1.2 : 1 }],
                  },
                ]}
              />
              <Text style={[styles.stepLabel, { color: step >= s ? colors.text : colors.textLight }]}>
                {s === 1 ? 'Details' : s === 2 ? 'Upload' : s === 3 ? 'Review' : 'Done'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header with Icon */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: colors.primaryAlpha }]}>
          <Ionicons name="location" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Where did you go?</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Share your amazing travel experience
        </Text>
      </View>

      {/* Location Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Destination</Text>
        <View style={[styles.inputGroup, { backgroundColor: colors.card }, shadows.sm]}>
          <Ionicons name="location" size={22} color={colors.primary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="e.g., Pokhara, Nepal"
            placeholderTextColor={colors.textLight}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          {formData.location.length > 0 && (
            <Ionicons name="checkmark-circle" size={22} color="#00C896" />
          )}
        </View>
      </View>

      {/* Duration and Budget Row */}
      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Duration</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }, shadows.sm]}>
            <Ionicons name="calendar" size={22} color="#9775FA" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Days"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={formData.days}
              onChangeText={(text) => setFormData({ ...formData, days: text })}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Budget</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card }, shadows.sm]}>
            <Ionicons name="cash" size={22} color="#00C896" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="NPR"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={formData.budget}
              onChangeText={(text) => setFormData({ ...formData, budget: text })}
            />
          </View>
        </View>
      </View>

      {/* Interests Section */}
      <View style={styles.interestsSection}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          What did you enjoy? <Text style={{ color: colors.textLight }}>(Select all that apply)</Text>
        </Text>
        <View style={styles.interestsGrid}>
          {interestOptions.map((interest) => {
            const isSelected = formData.interests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.interestChip,
                  {
                    backgroundColor: isSelected ? interest.color + '20' : colors.card,
                    borderColor: isSelected ? interest.color : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                  shadows.sm,
                ]}
                onPress={() => toggleInterest(interest.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.interestIconContainer,
                    { backgroundColor: isSelected ? interest.color : colors.backgroundAlt },
                  ]}
                >
                  <Ionicons
                    name={interest.icon}
                    size={20}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.interestText,
                    {
                      color: isSelected ? interest.color : colors.text,
                      fontWeight: isSelected ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                    },
                  ]}
                >
                  {interest.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color={interest.color} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            opacity:
              formData.location && formData.days && formData.budget && formData.interests.length
                ? 1
                : 0.5,
          },
        ]}
        disabled={
          !formData.location || !formData.days || !formData.budget || !formData.interests.length
        }
        onPress={() => goToNextStep(2)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#2679FF', '#00C896']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: '#9775FA20' }]}>
          <Ionicons name="videocam" size={32} color="#9775FA" />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Upload Your Video</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Share the best moments from your adventure
        </Text>
      </View>

      {/* Upload Box with Animation */}
      <TouchableOpacity
        style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.border }, shadows.md]}
        activeOpacity={0.8}
      >
        <View style={styles.uploadIconContainer}>
          <LinearGradient
            colors={['#2679FF20', '#00C89620']}
            style={styles.uploadIconGradient}
          >
            <Ionicons name="cloud-upload-outline" size={48} color="#2679FF" />
          </LinearGradient>
        </View>
        <Text style={[styles.uploadText, { color: colors.text }]}>Tap to upload video</Text>
        <Text style={[styles.uploadHint, { color: colors.textLight }]}>
          Max 60 seconds • MP4, MOV
        </Text>
        <View style={styles.uploadFeatures}>
          <View style={styles.uploadFeature}>
            <Ionicons name="checkmark-circle" size={16} color="#00C896" />
            <Text style={[styles.uploadFeatureText, { color: colors.textSecondary }]}>HD Quality</Text>
          </View>
          <View style={styles.uploadFeature}>
            <Ionicons name="checkmark-circle" size={16} color="#00C896" />
            <Text style={[styles.uploadFeatureText, { color: colors.textSecondary }]}>Auto-compress</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* AI Magic Card */}
      <View style={[styles.aiMagicCard, { backgroundColor: colors.card }, shadows.lg]}>
        <LinearGradient
          colors={['#FF6B6B20', '#FFD43B20']}
          style={styles.aiMagicGradient}
        >
          <View style={styles.aiMagicHeader}>
            <View style={styles.aiMagicIconContainer}>
              <Ionicons name="sparkles" size={24} color="#FF9500" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiMagicTitle, { color: colors.text }]}>AI Magic ✨</Text>
              <Text style={[styles.aiMagicText, { color: colors.textSecondary }]}>
                Upload your video and we'll automatically generate:
              </Text>
            </View>
          </View>
          <View style={styles.aiFeaturesList}>
            <View style={styles.aiFeature}>
              <Ionicons name="map" size={18} color="#2679FF" />
              <Text style={[styles.aiFeatureText, { color: colors.text }]}>Day-by-day itinerary</Text>
            </View>
            <View style={styles.aiFeature}>
              <Ionicons name="wallet" size={18} color="#00C896" />
              <Text style={[styles.aiFeatureText, { color: colors.text }]}>Budget breakdown</Text>
            </View>
            <View style={styles.aiFeature}>
              <Ionicons name="location" size={18} color="#FF6B6B" />
              <Text style={[styles.aiFeatureText, { color: colors.text }]}>Places you visited</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButtonNew, { backgroundColor: colors.card }, shadows.sm]}
          onPress={() => goToPreviousStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.aiButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleGenerateWithAI}
            disabled={aiGenerating}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={aiGenerating ? ['#9775FA', '#7C3AED'] : ['#FF9500', '#FF6B6B']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {aiGenerating ? (
                <>
                  <Ionicons name="sync" size={20} color="#FFFFFF" />
                  <Text style={styles.continueButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.continueButtonText}>Generate with AI</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.stepHeader}>
        <View style={[styles.stepIconContainer, { backgroundColor: '#00C89620' }]}>
          <Ionicons name="checkmark-done" size={32} color="#00C896" />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Review & Edit</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          AI-generated plan ready for your approval
        </Text>
      </View>

      {/* AI Badge */}
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={16} color="#FF9500" />
        <Text style={styles.aiBadgeText}>Generated by AI in 2.3s</Text>
      </View>

      {/* Itinerary Card - Modern Design */}
      <View style={[styles.reviewCardNew, { backgroundColor: colors.card }, shadows.lg]}>
        <View style={styles.reviewHeaderNew}>
          <LinearGradient
            colors={['#2679FF', '#9775FA']}
            style={styles.reviewIconContainer}
          >
            <Ionicons name="map" size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Itinerary</Text>
            <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>
              {formData.days} days • AI-optimized
            </Text>
          </View>
          <TouchableOpacity style={styles.editButtonNew}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.timelineContainer}>
          {[
            { day: 1, title: 'Arrival & Adventure', activities: 'Sunrise • Paragliding • Lake cruise' },
            { day: 2, title: 'Nature & Culture', activities: 'Peace Pagoda • Waterfalls • Shopping' },
            { day: 3, title: 'Departure', activities: 'Breakfast • Last minute shopping' },
          ].map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <View style={[styles.timelineDotInner, { backgroundColor: '#2679FF' }]} />
                {idx < 2 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
              </View>
              <View style={[styles.timelineContent, { backgroundColor: colors.backgroundAlt }]}>
                <Text style={[styles.timelineDay, { color: colors.textSecondary }]}>Day {item.day}</Text>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.timelineActivities, { color: colors.textSecondary }]}>
                  {item.activities}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Budget Card - Modern Design */}
      <View style={[styles.reviewCardNew, { backgroundColor: colors.card }, shadows.lg]}>
        <View style={styles.reviewHeaderNew}>
          <LinearGradient
            colors={['#00C896', '#51CF66']}
            style={styles.reviewIconContainer}
          >
            <Ionicons name="wallet" size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Budget</Text>
            <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>
              Total: NPR {formData.budget}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButtonNew}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.budgetBreakdown}>
          {[
            { label: 'Accommodation', amount: '4,500', icon: 'bed', percent: 36, color: '#2679FF' },
            { label: 'Food', amount: '3,500', icon: 'restaurant', percent: 28, color: '#00C896' },
            { label: 'Transport', amount: '2,000', icon: 'car', percent: 16, color: '#FF9500' },
            { label: 'Activities', amount: '2,500', icon: 'flame', percent: 20, color: '#FF6B6B' },
          ].map((item, idx) => (
            <View key={idx} style={styles.budgetItemNew}>
              <View style={styles.budgetItemLeft}>
                <View style={[styles.budgetIconCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.budgetItemLabel, { color: colors.text }]}>{item.label}</Text>
                  <View style={[styles.budgetProgressBar, { backgroundColor: colors.backgroundAlt }]}>
                    <View
                      style={[
                        styles.budgetProgress,
                        { width: `${item.percent}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <Text style={[styles.budgetItemAmount, { color: colors.text }]}>NPR {item.amount}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.backButtonNew, { backgroundColor: colors.card }, shadows.sm]}
          onPress={() => goToPreviousStep(2)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButtonFlex}
          onPress={() => goToNextStep(4)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#00C896', '#51CF66']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Publish Trip</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View
      style={[
        styles.successContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: confettiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Success Animation */}
      <Animated.View
        style={[
          styles.successIconContainer,
          {
            transform: [
              {
                scale: confettiAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.2, 1],
                }),
              },
              {
                rotate: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#00C896', '#51CF66']}
          style={styles.successGradient}
        >
          <Ionicons name="checkmark" size={60} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      {/* Confetti Effect */}
      <View style={styles.confettiContainer}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: ['#2679FF', '#00C896', '#FF9500', '#FF6B6B'][i % 4],
                transform: [
                  {
                    translateY: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 200 - 100],
                    }),
                  },
                  {
                    translateX: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (Math.random() - 0.5) * 200],
                    }),
                  },
                  {
                    rotate: confettiAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${Math.random() * 720}deg`],
                    }),
                  },
                ],
                opacity: confettiAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.successTitle, { color: colors.text }]}>Trip Published! 🎉</Text>
      <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
        Your trip to <Text style={{ fontWeight: FONT_WEIGHTS.bold }}>{formData.location}</Text> is now live and ready to inspire travelers!
      </Text>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }, shadows.lg]}>
        <View style={styles.statItemNew}>
          <Ionicons name="eye" size={24} color="#2679FF" />
          <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Views</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItemNew}>
          <Ionicons name="heart" size={24} color="#FF6B6B" />
          <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItemNew}>
          <Ionicons name="bookmark" size={24} color="#00C896" />
          <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saves</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.doneButtonNew}
        onPress={() => {
          navigation.goBack();
          navigation.navigate('Main', { screen: 'HomeTab' });
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#2679FF', '#9775FA']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="home" size={20} color="#FFFFFF" />
          <Text style={styles.continueButtonText}>Go to Home</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.viewPostButton}
        onPress={() => {
          navigation.goBack();
          setTimeout(() => {
            navigation.navigate('PostDetails');
          }, 100);
        }}
      >
        <Text style={[styles.viewPostText, { color: colors.primary }]}>View Your Post</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.primary} />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={[styles.shareButtonSuccess, { backgroundColor: colors.card }, shadows.sm]}>
        <Ionicons name="share-social" size={20} color={colors.text} />
        <Text style={[styles.shareButtonText, { color: colors.text }]}>Share with Friends</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      {step < 4 && renderProgressBar()}

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  stepContainer: {
    flex: 1,
  },

  // ===== Progress Bar =====
  progressBarContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 3,
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepDot: {
    alignItems: 'center',
  },
  stepDotInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: SPACING.xs,
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // ===== Step Header =====
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

  // ===== Step 1 Inputs =====
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
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
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },

  // ===== Interests Section =====
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
    marginBottom: SPACING.xl,
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

  // ===== Step 2 Upload =====
  uploadBox: {
    height: 220,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  uploadIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

  // ===== AI Magic Card =====
  aiMagicCard: {
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  aiMagicGradient: {
    padding: SPACING.lg,
  },
  aiMagicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  aiMagicIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF950020',
  },
  aiMagicTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  aiMagicText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  aiFeaturesList: {
    gap: SPACING.sm,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aiFeatureText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // ===== Buttons =====
  continueButton: {
    marginTop: SPACING.xl,
  },
  continueButtonFlex: {
    flex: 2,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  backButtonNew: {
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
  aiButtonContainer: {
    flex: 2,
  },
  aiButton: {
    flex: 1,
  },

  // ===== Step 3 AI Badge =====
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FF950020',
    marginBottom: SPACING.lg,
  },
  aiBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: '#FF9500',
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // ===== Step 3 Review Cards =====
  reviewCardNew: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  reviewHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  reviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  reviewSubtitle: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  editButtonNew: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2679FF20',
  },

  // ===== Timeline =====
  timelineContainer: {
    gap: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timelineDot: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: SPACING.xs,
  },
  timelineContent: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  timelineDay: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  timelineTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  timelineActivities: {
    fontSize: FONT_SIZES.sm,
  },

  // ===== Budget Breakdown =====
  budgetBreakdown: {
    gap: SPACING.md,
  },
  budgetItemNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  budgetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetItemLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.xs,
  },
  budgetProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 3,
  },
  budgetItemAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    marginLeft: SPACING.md,
  },

  // ===== Step 4 Success =====
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
  confettiContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    lineHeight: 22,
  },

  // ===== Stats Card =====
  statsCard: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  statItemNew: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: SPACING.sm,
  },

  // ===== Success Buttons =====
  doneButtonNew: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  viewPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  viewPostText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  shareButtonSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  shareButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

export default CreatePostScreen;
