import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type TypeFilter = 'all' | 'income' | 'expense';

export default function SearchScreen() {
  const { transactions } = useTransactions();
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  const filtered = useMemo((): Transaction[] => {
    const now = new Date();
    return transactions.filter(tx => {
      // Text search
      const q = query.toLowerCase();
      if (q && !tx.description.toLowerCase().includes(q) && !tx.category.toLowerCase().includes(q)) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Category filter
      if (selectedCategory && tx.category !== selectedCategory) return false;
      // Date filter
      const txDate = new Date(tx.date);
      if (dateFilter === 'today') {
        if (txDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        if (txDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
      }
      return true;
    });
  }, [transactions, query, dateFilter, typeFilter, selectedCategory]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Input */}
      <View style={styles.searchRow}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions..."
          placeholderTextColor={Colors.textMuted}
          autoFocus
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
        {/* Type */}
        {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
          <Pressable
            key={`type-${t}`}
            style={[styles.chip, typeFilter === t && styles.chipActive]}
            onPress={() => setTypeFilter(t)}
          >
            <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}

        <View style={styles.chipDivider} />

        {/* Date */}
        {([
          { key: 'all', label: 'Any Time' },
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
        ] as Array<{ key: DateFilter; label: string }>).map(d => (
          <Pressable
            key={`date-${d.key}`}
            style={[styles.chip, dateFilter === d.key && styles.chipActive]}
            onPress={() => setDateFilter(d.key)}
          >
            <Text style={[styles.chipText, dateFilter === d.key && styles.chipTextActive]}>{d.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>
        {(typeFilter !== 'all' || dateFilter !== 'all' || selectedCategory || query) ? (
          <Pressable onPress={() => { setQuery(''); setTypeFilter('all'); setDateFilter('all'); setSelectedCategory(''); }}>
            <Text style={styles.clearFilters}>Clear All</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Results */}
      <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length > 0 ? (
          filtered.map(tx => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onPress={(id) => router.push(`/transaction/${id}` as any)}
            />
          ))
        ) : (
          <EmptyState
            icon="search-off"
            title="No Results Found"
            subtitle={query ? `No transactions matching "${query}"` : 'Try adjusting your filters'}
          />
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    margin: Spacing.base, backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl, paddingHorizontal: Spacing.base,
    borderWidth: 1, borderColor: Colors.border, height: 48,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: Fonts.sizes.base },

  filtersScroll: { maxHeight: 48 },
  filtersContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: Colors.surfaceCard,
    borderWidth: 1, borderColor: Colors.borderLight, height: 32, justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, fontWeight: Fonts.weights.medium },
  chipTextActive: { color: Colors.text },
  chipDivider: { width: 1, height: 20, backgroundColor: Colors.divider },

  resultsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
  },
  resultsCount: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  clearFilters: { fontSize: Fonts.sizes.sm, color: Colors.accent, fontWeight: Fonts.weights.medium },

  results: { paddingHorizontal: Spacing.base },
});
