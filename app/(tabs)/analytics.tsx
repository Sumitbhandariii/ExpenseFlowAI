import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { BannerAdComponent } from '@/components/ads/BannerAdComponent';
import { CategoryBreakdownList, BarChart } from '@/components/charts/SpendingChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

type PeriodType = 'week' | 'month' | 'year';

function getMonthsData(transactions: any[], count: number) {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' });
    const income = transactions.filter(t => t.type === 'income' && t.date.startsWith(key)).reduce((s: number, t: any) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(key)).reduce((s: number, t: any) => s + t.amount, 0);
    months.push({ key, label, income, expenses, savings: income - expenses });
  }
  return months;
}

export default function AnalyticsScreen() {
  const { transactions, isLoading, getCategoryBreakdown, getMonthlyStats } = useTransactions();
  const [activeTab, setActiveTab] = useState<'expenses' | 'income' | 'trends'>('expenses');

  const expenseBreakdown = useMemo(() => getCategoryBreakdown('expense'), [getCategoryBreakdown]);
  const incomeBreakdown = useMemo(() => getCategoryBreakdown('income'), [getCategoryBreakdown]);
  const currentStats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);
  const monthlyData = useMemo(() => getMonthsData(transactions, 6), [transactions]);

  const barData = useMemo(() =>
    monthlyData.map(m => ({
      label: m.label,
      value: activeTab === 'income' ? m.income : activeTab === 'expenses' ? m.expenses : m.savings,
      color: activeTab === 'income' ? Colors.income : activeTab === 'expenses' ? Colors.expense : Colors.primary,
    })),
    [monthlyData, activeTab]
  );

  if (isLoading) return <LoadingSpinner fullScreen message="Loading analytics..." />;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.monthLabel}>{monthName}</Text>
          </View>
          <Pressable
            style={styles.aiBtn}
            onPress={() => router.push('/ai-advisor')}
          >
            <MaterialIcons name="auto-awesome" size={16} color={Colors.textInverse} />
            <Text style={styles.aiBtnText}>AI Report</Text>
          </Pressable>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCard} padding={Spacing.md}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, { color: Colors.income }]}>
              {APP_CONFIG.currency}{currentStats.totalIncome.toLocaleString('en-IN')}
            </Text>
          </GlassCard>
          <GlassCard style={styles.summaryCard} padding={Spacing.md}>
            <Text style={styles.summaryLabel}>Total Expense</Text>
            <Text style={[styles.summaryValue, { color: Colors.expense }]}>
              {APP_CONFIG.currency}{currentStats.totalExpenses.toLocaleString('en-IN')}
            </Text>
          </GlassCard>
          <GlassCard style={[styles.summaryCard, { borderColor: currentStats.savings >= 0 ? `${Colors.success}40` : `${Colors.error}40` }]} padding={Spacing.md}>
            <Text style={styles.summaryLabel}>Net Savings</Text>
            <Text style={[styles.summaryValue, { color: currentStats.savings >= 0 ? Colors.success : Colors.error }]}>
              {APP_CONFIG.currency}{Math.abs(currentStats.savings).toLocaleString('en-IN')}
            </Text>
          </GlassCard>
        </View>

        {/* Banner Ad */}
        <BannerAdComponent size="banner" />

        {/* 6-Month Bar Chart */}
        <GlassCard style={styles.chartCard} padding={Spacing.base}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>6-Month Overview</Text>
          </View>

          <View style={styles.tabRow}>
            {[
              { key: 'expenses', label: 'Expenses', color: Colors.expense },
              { key: 'income', label: 'Income', color: Colors.income },
              { key: 'trends', label: 'Savings', color: Colors.primary },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.chartTab, activeTab === tab.key && { backgroundColor: `${tab.color}25`, borderColor: tab.color }]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text style={[styles.chartTabText, activeTab === tab.key && { color: tab.color }]}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          <BarChart data={barData} height={200} showValues />
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard style={styles.breakdownCard} padding={Spacing.base}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Expense Breakdown</Text>
          </View>
          {expenseBreakdown.length > 0 ? (
            <CategoryBreakdownList data={expenseBreakdown} showAmount />
          ) : (
            <EmptyState icon="pie-chart" title="No Expense Data" subtitle="Add some expenses to see breakdown" />
          )}
        </GlassCard>

        {/* Income Sources */}
        <GlassCard style={styles.breakdownCard} padding={Spacing.base}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Income Sources</Text>
          </View>
          {incomeBreakdown.length > 0 ? (
            <CategoryBreakdownList data={incomeBreakdown} showAmount />
          ) : (
            <EmptyState icon="account-balance-wallet" title="No Income Data" subtitle="Add income transactions to see sources" />
          )}
        </GlassCard>

        {/* Monthly Trends Table */}
        <GlassCard style={styles.breakdownCard} padding={Spacing.base}>
          <Text style={styles.chartTitle}>Monthly Summary</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>Month</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, styles.textRight]}>Income</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, styles.textRight]}>Expense</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText, styles.textRight]}>Savings</Text>
          </View>
          {monthlyData.reverse().map((m, i) => (
            <View key={m.key} style={[styles.tableRow, i < monthlyData.length - 1 && styles.tableRowBorder]}>
              <Text style={styles.tableCell}>{m.label}</Text>
              <Text style={[styles.tableCell, styles.textRight, { color: Colors.income }]}>
                {APP_CONFIG.currency}{(m.income / 1000).toFixed(0)}K
              </Text>
              <Text style={[styles.tableCell, styles.textRight, { color: Colors.expense }]}>
                {APP_CONFIG.currency}{(m.expenses / 1000).toFixed(0)}K
              </Text>
              <Text style={[styles.tableCell, styles.textRight, { color: m.savings >= 0 ? Colors.success : Colors.error }]}>
                {m.savings < 0 ? '-' : ''}{APP_CONFIG.currency}{(Math.abs(m.savings) / 1000).toFixed(0)}K
              </Text>
            </View>
          ))}
        </GlassCard>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold, color: Colors.text },
  monthLabel: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full, height: 40,
  },
  aiBtnText: { color: Colors.textInverse, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },

  summaryRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.md,
  },
  summaryCard: { flex: 1 },
  summaryLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },

  chartCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  chartTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.semiBold, color: Colors.text, marginBottom: Spacing.md },
  tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  chartTab: {
    flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  chartTabText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, fontWeight: Fonts.weights.medium },

  breakdownCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  sectionHeader: { marginBottom: Spacing.md },

  tableHeader: { flexDirection: 'row', paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider, marginBottom: Spacing.sm },
  tableRow: { flexDirection: 'row', paddingVertical: Spacing.sm },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableCell: { flex: 1, fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  tableHeaderText: { fontWeight: Fonts.weights.semiBold, color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  textRight: { textAlign: 'right' },
});
