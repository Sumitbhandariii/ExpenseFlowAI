import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export function ProgressBar({ progress, color, height = 8, showLabel, label }: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const pct = Math.round(clamped * 100);
  
  let barColor = color ?? Colors.primary;
  if (!color) {
    if (clamped >= 1) barColor = Colors.error;
    else if (clamped >= 0.8) barColor = Colors.warning;
    else barColor = Colors.primary;
  }

  return (
    <View>
      {showLabel ? (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <Text style={[styles.pct, { color: barColor }]}>{pct}%</Text>
        </View>
      ) : null}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radius.full,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  pct: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
  },
});
