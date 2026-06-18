import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCategoryById } from '@/constants/categories';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

interface CategoryBadgeProps {
  categoryId: string;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ categoryId, size = 'md' }: CategoryBadgeProps) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: `${category.color}20` }, isSmall && styles.badgeSm]}>
      <MaterialIcons name={category.icon as any} size={isSmall ? 12 : 14} color={category.color} />
      <Text style={[styles.label, { color: category.color }, isSmall && styles.labelSm]}>
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
  labelSm: {
    fontSize: Fonts.sizes.xs,
  },
});
