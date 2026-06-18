import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { BannerAdComponent } from '@/components/ads/BannerAdComponent';
import { useSavings } from '@/hooks/useSavings';
import { ProgressBar } from '@/components/ui/ProgressBar';

const GREETING_ICONS = ['wb-sunny', 'nights-stay', 'wb-twilight'];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen() {
  const { transactions, isLoading, getMonthlyStats, getCategoryBreakdown, refreshTransactions } = useTransactions();
  const { goals } = useSavings();

  const stats = useMemo(() => getMonthlyStats(), [getMonthlyStats]);
  const expenseBreakdown = useMemo(() => getCategoryBreakdown('expense'), [getCategoryBreakdown]);
  const recentTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);
  const topGoal = useMemo(() => goals[0], [goals]);

  const savingsRate = stats.totalIncome > 0
    ? ((stats.savings / stats.totalIncome) * 100).toFixed(1)
    : '0';

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  }, [refreshTransactions]);

  if (isLoading) return <LoadingSpinner message="Loading your finances..." fullScreen />;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.headerTitle}>ExpenseFlow AI</Text>
            <Text style={styles.monthLabel}>{monthName}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/search')}>
              <MaterialIcons name="search" size={22} color={Colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/ai-advisor')}>
              <MaterialIcons name="auto-awesome" size={22} color={Colors.accent} />
            </Pressable>
          </View>
        </View>

        {/* Balance Hero Card */}
        <GlassCard style={styles.heroCard} variant="elevated">
          <View style={styles.heroContent}>
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Net Balance</Text>
              <Text style={[styles.balanceAmount, { color: stats.savings >= 0 ? Colors.success : Colors.error }]}>
                {stats.savings < 0 ? '-' : ''}{APP_CONFIG.currency}{Math.abs(stats.savings).toLocaleString('en-IN')}
              </Text>
              <View style={[styles.savingsRateBadge, { backgroundColor: parseFloat(savingsRate) >= 20 ? Colors.successBg : Colors.warningBg }]}>
                <MaterialIcons
                  name={parseFloat(savingsRate) >= 20 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={parseFloat(savingsRate) >= 20 ? Colors.success : Colors.warning}
                />
                <Text style={[styles.savingsRateText, { color: parseFloat(savingsRate) >= 20 ? Colors.success : Colors.warning }]}>
                  {savingsRate}% Savings Rate
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.incomeBg }]}>
                  <MaterialIcons name="arrow-downward" size={14} color={Colors.income} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={[styles.statValue, { color: Colors.income }]}>
                    {APP_CONFIG.currency}{(stats.totalIncome / 1000).toFixed(0)}K
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.expenseBg }]}>
                  <MaterialIcons name="arrow-upward" size={14} color={Colors.expense} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={[styles.statValue, { color: Colors.expense }]}>
                    {APP_CONFIG.currency}{(stats.totalExpenses / 1000).toFixed(0)}K
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.infoBg }]}>
                  <MaterialIcons name="receipt" size={14} color={Colors.info} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Tx Count</Text>
                  <Text style={[styles.statValue, { color: Colors.info }]}>{stats.transactionCount}</Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-circle', label: 'Add Income', color: Colors.income, route: '/transaction/add?type=income' },
              { icon: 'remove-circle', label: 'Add Expense', color: Colors.expense, route: '/transaction/add?type=expense' },
              { icon: 'bar-chart', label: 'Analytics', color: Colors.primary, route: '/(tabs)/analytics' },
              { icon: 'auto-awesome', label: 'AI Advisor', color: Colors.accent, route: '/ai-advisor' },
            ].map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Banner Ad */}
        <BannerAdComponent size="banner" />

        {/* Top Spending Categories */}
        {expenseBreakdown.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Spending</Text>
              <Pressable onPress={() => router.push('/(tabs)/analytics')}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            <GlassCard padding={Spacing.base}>
              {expenseBreakdown.slice(0, 4).map((item, index) => (
                <View key={item.categoryId} style={[styles.categoryRow, index < 3 && styles.categoryBorder]}>
                  <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName} numberOfLines={1}>{item.categoryName}</Text>
                  <View style={styles.categoryRight}>
                    <ProgressBar
                      progress={item.percentage / 100}
                      color={item.color}
                      height={4}
                    />
                    <Text style={styles.categoryAmount}>
                      {APP_CONFIG.currency}{item.total.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.categoryPct, { color: item.color }]}>
                      {item.percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </View>
        ) : null}

        {/* Savings Goal Preview */}
        {topGoal ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Savings Goal</Text>
              <Pressable onPress={() => router.push('/savings')}>
                <Text style={styles.seeAll}>View All</Text>
              </Pressable>
            </View>
            <GlassCard variant="highlight" padding={Spacing.base} onPress={() => router.push('/savings')}>
              <View style={styles.goalHeader}>
                <View style={[styles.goalIcon, { backgroundColor: `${topGoal.color}20` }]}>
                  <MaterialIcons name={topGoal.icon as any} size={20} color={topGoal.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{topGoal.title}</Text>
                  <Text style={styles.goalAmount}>
                    {APP_CONFIG.currency}{topGoal.currentAmount.toLocaleString('en-IN')} / {APP_CONFIG.currency}{topGoal.targetAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={[styles.goalPct, { color: topGoal.color }]}>
                  {((topGoal.currentAmount / topGoal.targetAmount) * 100).toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                progress={topGoal.currentAmount / topGoal.targetAmount}
                color={topGoal.color}
                height={8}
              />
            </GlassCard>
          </View>
        ) : null}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onPress={(id) => router.push(`/transaction/${id}` as any)}
              />
            ))
          ) : (
            <EmptyState
              icon="receipt-long"
              title="No Transactions Yet"
              subtitle="Start tracking your finances by adding your first transaction"
            />
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/transaction/add')}
      >
        <MaterialIcons name="add" size={28} color={Colors.text} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.base,
  },
  greeting: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
  },
  monthLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  heroContent: {
    gap: Spacing.base,
  },
  balanceSection: {
    gap: Spacing.xs,
  },
  balanceLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  balanceAmount: {
    fontSize: Fonts.sizes.display,
    fontWeight: Fonts.weights.extraBold,
    letterSpacing: -0.5,
  },
  savingsRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  savingsRateText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.sm,
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.text,
  },
  seeAll: {
    fontSize: Fonts.sizes.sm,
    color: Colors.accent,
    fontWeight: Fonts.weights.medium,
  },

  // Categories
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: 160,
  },
  categoryAmount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    fontWeight: Fonts.weights.medium,
    minWidth: 60,
    textAlign: 'right',
  },
  categoryPct: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    minWidth: 28,
    textAlign: 'right',
  },

  // Savings Goal
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.text,
  },
  goalAmount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  goalPct: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.93 }],
    opacity: 0.9,
  },
});
