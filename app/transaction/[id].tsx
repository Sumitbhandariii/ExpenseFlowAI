import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { AppButton } from '@/components/ui/AppButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { transactions, deleteTransaction } = useTransactions();

  const transaction = useMemo(
    () => transactions.find(t => t.id === id),
    [transactions, id]
  );

  const [deleting, setDeleting] = useState(false);

  if (!transaction) return <LoadingSpinner fullScreen message="Loading..." />;

  const isIncome = transaction.type === 'income';
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setDeleting(true);
            await deleteTransaction(transaction.id);
            router.back();
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <GlassCard style={styles.heroCard} variant="elevated" padding={Spacing.xl}>
          <View style={styles.heroContent}>
            <View style={[styles.typeIcon, { backgroundColor: isIncome ? Colors.incomeBg : Colors.expenseBg }]}>
              <MaterialIcons
                name={isIncome ? 'arrow-downward' : 'arrow-upward'}
                size={32}
                color={isIncome ? Colors.income : Colors.expense}
              />
            </View>
            <Text style={styles.transactionType}>{isIncome ? 'Income' : 'Expense'}</Text>
            <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.expense }]}>
              {isIncome ? '+' : '-'}{APP_CONFIG.currency}{transaction.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.description}>{transaction.description}</Text>
            <CategoryBadge categoryId={transaction.category} size="md" />
          </View>
        </GlassCard>

        {/* Details */}
        <GlassCard padding={Spacing.base} style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          {[
            { label: 'Date', value: formattedDate, icon: 'calendar-today' },
            { label: 'Category', value: transaction.category, icon: 'category' },
            { label: 'Transaction ID', value: `#${transaction.id}`, icon: 'tag' },
            { label: 'Created', value: new Date(transaction.createdAt).toLocaleString('en-IN'), icon: 'schedule' },
          ].map(item => (
            <View key={item.label} style={styles.detailRow}>
              <MaterialIcons name={item.icon as any} size={16} color={Colors.textMuted} />
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{item.value}</Text>
            </View>
          ))}

          {transaction.note ? (
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Note</Text>
              <Text style={styles.noteText}>{transaction.note}</Text>
            </View>
          ) : null}
        </GlassCard>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title="Delete Transaction"
            onPress={handleDelete}
            variant="danger"
            icon="delete"
            fullWidth
            loading={deleting}
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },

  heroCard: { marginBottom: Spacing.base },
  heroContent: { alignItems: 'center', gap: Spacing.md },
  typeIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  transactionType: { fontSize: Fonts.sizes.base, color: Colors.textMuted, fontWeight: Fonts.weights.medium },
  amount: { fontSize: Fonts.sizes.hero, fontWeight: Fonts.weights.extraBold, letterSpacing: -1 },
  description: { fontSize: Fonts.sizes.lg, color: Colors.text, fontWeight: Fonts.weights.semiBold, textAlign: 'center' },

  detailCard: { marginBottom: Spacing.base },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.semiBold, color: Colors.text, marginBottom: Spacing.base },
  detailRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  detailLabel: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  detailValue: { flex: 2, fontSize: Fonts.sizes.sm, color: Colors.text, textAlign: 'right', fontWeight: Fonts.weights.medium },

  noteSection: { marginTop: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.lg },
  noteLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 4, fontWeight: Fonts.weights.semiBold },
  noteText: { fontSize: Fonts.sizes.base, color: Colors.textSecondary, lineHeight: 22 },

  actions: { gap: Spacing.md },
});
