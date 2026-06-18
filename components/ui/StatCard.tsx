import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';

interface StatCardProps {
  title: string;
  amount: number;
  icon: string;
  iconColor: string;
  iconBg: string;
  trend?: number;
  subtitle?: string;
  compact?: boolean;
}

export function StatCard({ title, amount, icon, iconColor, iconBg, trend, subtitle, compact }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  const formatted = amount.toLocaleString('en-IN');

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={compact ? 18 : 22} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={[styles.amount, compact && styles.amountCompact]}>
          {APP_CONFIG.currency}{formatted}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
        {trend !== undefined ? (
          <View style={styles.trendRow}>
            <MaterialIcons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositive ? Colors.success : Colors.error}
            />
            <Text style={[styles.trend, { color: isPositive ? Colors.success : Colors.error }]}>
              {Math.abs(trend).toFixed(1)}% vs last month
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  compact: {
    padding: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    marginBottom: 2,
  },
  amount: {
    fontSize: Fonts.sizes.xl,
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
  },
  amountCompact: {
    fontSize: Fonts.sizes.lg,
  },
  subtitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  trend: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
  },
});
