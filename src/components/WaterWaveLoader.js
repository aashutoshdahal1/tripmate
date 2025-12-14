import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const WaterWaveLoader = ({ progress = 0, height = 4, color = '#00C896' }) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wave animation - continuous loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Progress animation - smooth transition
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Background track */}
      <View style={[styles.track, { backgroundColor: color + '20' }]} />
      
      {/* Progress container with overflow hidden */}
      <Animated.View 
        style={[
          styles.progressContainer,
          { 
            width: progressWidth,
            height,
          }
        ]}
      >
        {/* Animated wave effect */}
        <Animated.View
          style={[
            styles.waveContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              color + '60',
              color + 'FF',
              color + 'FF',
              color + '60',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.wave}
          />
          <LinearGradient
            colors={[
              color + '60',
              color + 'FF',
              color + 'FF',
              color + '60',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.wave}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 2,
    overflow: 'hidden',
  },
  waveContainer: {
    flexDirection: 'row',
    height: '100%',
    width: width * 2,
  },
  wave: {
    width: width,
    height: '100%',
  },
});

export default WaterWaveLoader;
