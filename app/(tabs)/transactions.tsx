import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppButton } from '@/components/ui/AppButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GlassCard } from '@/components/ui/GlassCard';
import { APP_CONFIG } from '@/constants/config';

type FilterType = 'all' | 'income' | 'expense';

function groupByDate(transactions: Transaction[]): Array<{ title: string; data: Transaction[] }> {
  const groups: Record<string, Transaction[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  transactions.forEach(tx => {
    const d = new Date(tx.date);
    let label: string;
    if (d.toDateString() === today) label = 'Today';
    else if (d.toDateString() === yesterday) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default function TransactionsScreen() {
  const { transactions, isLoading, deleteTransaction, getMonthlyStats } = useTransactions();
  const [filter, setFilter] = useState<FilterType>('all');
  const stats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading transactions..." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/search')}>
            <MaterialIcons name="search" size={22} color={Colors.text} />
          </Pressable>
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/transaction/add')}
          >
            <MaterialIcons name="add" size={20} color={Colors.text} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        <View style={styles.stripItem}>
          <Text style={styles.stripLabel}>Income</Text>
          <Text style={[styles.stripValue, { color: Colors.income }]}>
            {APP_CONFIG.currency}{stats.totalIncome.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={styles.stripLabel}>Expenses</Text>
          <Text style={[styles.stripValue, { color: Colors.expense }]}>
            {APP_CONFIG.currency}{stats.totalExpenses.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={styles.stripLabel}>Savings</Text>
          <Text style={[styles.stripValue, { color: stats.savings >= 0 ? Colors.success : Colors.error }]}>
            {APP_CONFIG.currency}{Math.abs(stats.savings).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Transaction List */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{section.title}</Text>
              <Text style={styles.sectionCount}>{section.data.length} transactions</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={(id) => router.push(`/transaction/${id}` as any)}
              onDelete={deleteTransaction}
            />
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <EmptyState
            icon={filter === 'income' ? 'arrow-downward' : filter === 'expense' ? 'arrow-upward' : 'receipt-long'}
            title={`No ${filter === 'all' ? '' : filter} Transactions`}
            subtitle="Tap the Add button to record your first transaction"
            action={
              <AppButton
                title="Add Transaction"
                onPress={() => router.push('/transaction/add')}
                variant="primary"
                icon="add"
              />
            }
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold, color: Colors.text },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full, height: 40,
  },
  addBtnText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semiBold },

  // Stats Strip
  statsStrip: {
    flexDirection: 'row', marginHorizontal: Spacing.base, marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 3 },
  stripValue: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
  stripDivider: { width: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.sm },

  // Filter
  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceCard, marginHorizontal: Spacing.base,
    borderRadius: Radius.xl, padding: 4, borderWidth: 1, borderColor: Colors.border,
  },
  filterTab: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.lg,
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, fontWeight: Fonts.weights.medium },
  filterTextActive: { color: Colors.text, fontWeight: Fonts.weights.semiBold },

  list: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  sectionDate: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.text },
  sectionCount: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  emptyContainer: { flex: 1, justifyContent: 'center' },
});
