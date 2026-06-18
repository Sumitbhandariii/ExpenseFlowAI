import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

// NOTE: Real AdMob integration requires Expo Development Build
// This component renders a placeholder in Expo Go preview
// For production: replace with react-native-google-mobile-ads BannerAd component

interface BannerAdComponentProps {
  size?: 'banner' | 'largeBanner' | 'mediumRectangle';
}

export function BannerAdComponent({ size = 'banner' }: BannerAdComponentProps) {
  const height = size === 'banner' ? 50 : size === 'largeBanner' ? 90 : 250;

  return (
    <View style={[styles.container, { height }]}>
      <MaterialIcons name="ads-click" size={14} color={Colors.textMuted} />
      <Text style={styles.label}>Advertisement</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Ad</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${Colors.surfaceElevated}`,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
  },
  badge: {
    position: 'absolute',
    right: 6,
    top: 4,
    backgroundColor: Colors.warningBg,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: Radius.xs,
  },
  badgeText: {
    fontSize: 9,
    color: Colors.warning,
    fontWeight: Fonts.weights.bold,
  },
});
