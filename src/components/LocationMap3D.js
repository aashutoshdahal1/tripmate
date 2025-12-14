import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const { width } = Dimensions.get('window');

/**
 * 🗺️ 3D Location Map Component
 * 
 * Features:
 * - 3D terrain visualization with satellite/hybrid view
 * - Smooth camera animations
 * - Pitch control for 3D perspective
 * - Interactive rotation and zoom
 * - Location marker with custom styling
 */
const LocationMap3D = ({ 
  location, 
  height = 250, 
  showControls = true,
  onLocationPress,
  style,
}) => {
  const { colors } = useTheme();
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('hybrid'); // 'standard', 'satellite', 'hybrid'
  const [is3DMode, setIs3DMode] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Animate to location with 3D effect
    if (location && mapRef.current) {
      setTimeout(() => {
        animateToLocation(true);
      }, 300);
    }
  }, [location]);

  const animateToLocation = (with3D = is3DMode) => {
    if (!location || !mapRef.current) return;

    mapRef.current.animateCamera({
      center: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      pitch: with3D ? 60 : 0, // 3D tilt angle (0-90 degrees)
      heading: with3D ? 45 : 0, // Rotation angle
      altitude: 3000, // Height above ground
      zoom: 15, // Zoom level
    }, { duration: 1500 });
  };

  const toggle3DMode = () => {
    const new3DMode = !is3DMode;
    setIs3DMode(new3DMode);
    animateToLocation(new3DMode);
  };

  const rotateMap = () => {
    if (!mapRef.current) return;
    
    mapRef.current.animateCamera({
      heading: Math.random() * 360, // Random rotation
      pitch: is3DMode ? 60 : 0,
    }, { duration: 1000 });
  };

  const cycleMapType = () => {
    const types = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  if (!location) {
    return (
      <View style={[styles.container, { height, backgroundColor: colors.card }, style]}>
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={48} color={colors.textLight} />
          <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>
            No location data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { height, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        pitchEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        scrollEnabled={true}
        onPress={onLocationPress}
      >
        {/* Custom Marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={location.address?.formatted || 'Location'}
        >
          <View style={styles.markerContainer}>
            <View style={[styles.markerPulse, { backgroundColor: colors.accent + '40' }]} />
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              style={styles.marker}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </Marker>
      </MapView>

      {/* Map Controls */}
      {showControls && (
        <View style={styles.controlsContainer}>
          {/* 3D Toggle */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: is3DMode ? colors.accent : colors.card },
            ]}
            onPress={toggle3DMode}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="cube-outline" 
              size={20} 
              color={is3DMode ? '#FFFFFF' : colors.text} 
            />
          </TouchableOpacity>

          {/* Rotate */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.card }]}
            onPress={rotateMap}
            activeOpacity={0.7}
          >
            <Ionicons name="sync-outline" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Map Type */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.card }]}
            onPress={cycleMapType}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={
                mapType === 'satellite' ? 'globe-outline' : 
                mapType === 'hybrid' ? 'layers-outline' : 
                'map-outline'
              } 
              size={20} 
              color={colors.text} 
            />
          </TouchableOpacity>

          {/* Recenter */}
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.card }]}
            onPress={() => animateToLocation(is3DMode)}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Location Info Badge */}
      {location.address && (
        <View style={[styles.infoBadge, { backgroundColor: colors.card + 'EE' }]}>
          <Ionicons name="location" size={14} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={1}>
            {location.address.formatted || location.address.city}
          </Text>
        </View>
      )}

      {/* Coordinates Badge */}
      <View style={[styles.coordsBadge, { backgroundColor: colors.card + 'EE' }]}>
        <Text style={[styles.coordsText, { color: colors.textSecondary }]}>
          {`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  noLocationText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlsContainer: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  infoBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    flex: 1,
  },
  coordsBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  coordsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    fontFamily: 'monospace',
  },
});

export default LocationMap3D;
