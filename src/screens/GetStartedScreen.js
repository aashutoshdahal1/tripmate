import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const GetStartedScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt || colors.background]}
        style={styles.gradientBackground}
      >
        {/* Hero Image Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg' }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}
            />
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* App Icon */}
          <View style={[styles.appIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="airplane" size={32} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>TripMate</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Your Travel Companion
          </Text>

          {/* Features */}
          <View style={styles.features}>
            {[
              { icon: 'videocam', text: 'Travel Videos', color: '#FF3B30' },
              { icon: 'map', text: 'Trip Plans', color: '#00C896' },
              { icon: 'sparkles', text: 'AI Assistant', color: '#FF9500' },
            ].map((feature, idx) => (
              <View key={idx} style={[styles.featureChip, { backgroundColor: colors.card }]}>
                <Ionicons name={feature.icon} size={18} color={feature.color} />
                <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginButtonText, { color: colors.text }]}>Sign In</Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={[styles.termsText, { color: colors.textLight }]}>
            By continuing, you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms</Text> &{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.4,
  },
  imageContainer: {
    width: width,
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl + 4,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xxxl,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  ctaSection: {
    marginBottom: SPACING.lg,
  },
  signupButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  skipButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default GetStartedScreen;
