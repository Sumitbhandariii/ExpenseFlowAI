import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { getCategoryById } from '@/constants/categories';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function TransactionItem({ transaction, onPress, onDelete }: TransactionItemProps) {
  const category = getCategoryById(transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={() => onPress?.(transaction.id)}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${category?.color ?? Colors.primary}20` }]}>
        <MaterialIcons name={(category?.icon ?? 'attach-money') as any} size={20} color={category?.color ?? Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.category}>{category?.name ?? transaction.category}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.expense }]}>
          {isIncome ? '+' : '-'}{APP_CONFIG.currency}{transaction.amount.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  desc: {
    fontSize: Fonts.sizes.base,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
  },
  category: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
  },
  date: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
