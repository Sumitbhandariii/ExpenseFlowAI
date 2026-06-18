import React, { ReactNode } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function AppButton({
  title, onPress, variant = 'primary', size = 'md',
  icon, iconPosition = 'left', loading, disabled, style, fullWidth = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textColor = variant === 'outline' || variant === 'ghost'
    ? Colors.primary
    : variant === 'secondary'
    ? Colors.textSecondary
    : Colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [...containerStyles, pressed && !isDisabled && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' ? (
            <MaterialIcons name={icon as any} size={size === 'sm' ? 16 : 20} color={textColor} />
          ) : null}
          <Text style={[styles.text, styles[`text_${size}`], { color: textColor }]}>{title}</Text>
          {icon && iconPosition === 'right' ? (
            <MaterialIcons name={icon as any} size={size === 'sm' ? 16 : 20} color={textColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },

  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 36 },
  size_md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 44 },
  size_lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl, minHeight: 52 },

  variant_primary: { backgroundColor: Colors.primary },
  variant_secondary: { backgroundColor: Colors.surfaceElevated },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.primary },
  variant_ghost: { backgroundColor: 'transparent' },
  variant_danger: { backgroundColor: Colors.error },

  text: { fontWeight: Fonts.weights.semiBold, color: Colors.text },
  text_sm: { fontSize: Fonts.sizes.sm },
  text_md: { fontSize: Fonts.sizes.base },
  text_lg: { fontSize: Fonts.sizes.md },
});
