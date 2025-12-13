import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { BORDER_RADIUS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.primary, colors.primaryDark];
      case 'accent':
        return [colors.accent, colors.accentDark];
      case 'outline':
        return null;
      default:
        return [colors.primary, colors.primaryDark];
    }
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.outlineButton,
          { borderColor: colors.primary },
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        {icon && <Ionicons name={icon} size={18} color={colors.primary} />}
        <Text style={[styles.outlineText, { color: colors.primary }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  const gradientColors = getColors();

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {icon && <Ionicons name={icon} size={18} color="#FFFFFF" />}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },
  outlineButton: {
    borderWidth: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  outlineText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
