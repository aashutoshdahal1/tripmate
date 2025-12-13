// TripMate - New Color System
// Primary: Blue (#2679FF), Accent: Green (#00C896)

export const COLORS = {
  // Light Mode Colors
  light: {
    // Primary Colors - Blue
    primary: '#2679FF',
    primaryDark: '#1A5FE6',
    primaryLight: '#4D91FF',
    primaryAlpha: 'rgba(38, 121, 255, 0.1)',
    
    // Accent Colors - Green
    accent: '#00C896',
    accentDark: '#00B085',
    accentLight: '#1AD4A5',
    accentAlpha: 'rgba(0, 200, 150, 0.1)',
    
    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    
    // Background Colors (Soft neutral - reduces eye fatigue)
    background: '#F7F9FC',
    backgroundAlt: '#F0F3F7',
    card: '#FFFFFF',
    
    // UI Elements
    border: '#E5E7EB',
    divider: '#D1D5DB',
    
    // Status Colors
    success: '#00C896',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#2679FF',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Dark Mode Colors
  dark: {
    // Primary Colors - Blue
    primary: '#4D91FF',
    primaryDark: '#2679FF',
    primaryLight: '#6BA3FF',
    primaryAlpha: 'rgba(77, 145, 255, 0.2)',
    
    // Accent Colors - Green
    accent: '#1AD4A5',
    accentDark: '#00C896',
    accentLight: '#33DCB3',
    accentAlpha: 'rgba(26, 212, 165, 0.2)',
    
    // Text Colors
    text: '#F5F5F5',
    textSecondary: '#B0B0B0',
    textLight: '#8A8A9A',
    
    // Background Colors
    background: '#0F0F0F',
    backgroundAlt: '#1A1A1A',
    card: '#1F1F1F',
    
    // UI Elements
    border: '#2C2C2C',
    divider: '#3A3A3A',
    
    // Status Colors
    success: '#1AD4A5',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#4D91FF',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Gradient definitions
export const GRADIENTS = {
  light: {
    primary: ['#2679FF', '#1A5FE6'],
    accent: ['#00C896', '#00B085'],
    brand: ['#2679FF', '#00C896'],
  },
  dark: {
    primary: ['#4D91FF', '#2679FF'],
    accent: ['#1AD4A5', '#00C896'],
    brand: ['#4D91FF', '#1AD4A5'],
  },
};

// Spacing system (4px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Font sizes
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// Font weights
export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Border radius
export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  round: 9999,
};

// Shadow system
export const SHADOWS = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
};
