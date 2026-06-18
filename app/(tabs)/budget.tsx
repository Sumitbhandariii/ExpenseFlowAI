import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Alert, Modal,
  TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useBudget } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { BUDGET_THRESHOLDS } from '@/constants/config';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetScreen() {
  const { budgets, isLoading, addBudget, deleteBudget } = useBudget();
  const { getCategoryBreakdown } = useTransactions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const currentMonth = getCurrentMonth();
  const breakdown = useMemo(() => getCategoryBreakdown('expense', currentMonth), [getCategoryBreakdown, currentMonth]);
  const monthBudgets = useMemo(() => budgets.filter(b => b.month === currentMonth), [budgets, currentMonth]);

  const budgetsWithSpent = useMemo(() =>
    monthBudgets.map(budget => {
      const cat = breakdown.find(b => b.categoryId === budget.categoryId);
      return { ...budget, actualSpent: cat?.total ?? budget.spent };
    }),
    [monthBudgets, breakdown]
  );

  const totalBudget = budgetsWithSpent.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.actualSpent, 0);
  const overBudgetCount = budgetsWithSpent.filter(b => b.actualSpent > b.amount).length;

  const handleAddBudget = async () => {
    if (!selectedCategory || !budgetAmount || isNaN(parseFloat(budgetAmount))) {
      Alert.alert('Error', 'Please select a category and enter a valid amount');
      return;
    }
    await addBudget({
      categoryId: selectedCategory,
      amount: parseFloat(budgetAmount),
      month: currentMonth,
    });
    setShowAddModal(false);
    setSelectedCategory('');
    setBudgetAmount('');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Budget', `Remove budget for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
    ]);
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading budgets..." />;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Budget Planner</Text>
            <Text style={styles.monthLabel}>{monthName}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={20} color={Colors.text} />
            <Text style={styles.addBtnText}>Budget</Text>
          </Pressable>
        </View>

        {/* Overview Card */}
        <GlassCard style={styles.overviewCard} variant="elevated">
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Budget</Text>
              <Text style={styles.overviewValue}>{APP_CONFIG.currency}{totalBudget.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Spent</Text>
              <Text style={[styles.overviewValue, { color: totalSpent > totalBudget ? Colors.error : Colors.text }]}>
                {APP_CONFIG.currency}{totalSpent.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Over Budget</Text>
              <Text style={[styles.overviewValue, { color: overBudgetCount > 0 ? Colors.error : Colors.success }]}>
                {overBudgetCount} items
              </Text>
            </View>
          </View>

          {totalBudget > 0 ? (
            <View style={{ marginTop: Spacing.md }}>
              <ProgressBar
                progress={totalSpent / totalBudget}
                showLabel
                label="Overall Budget Used"
                height={10}
              />
            </View>
          ) : null}
        </GlassCard>

        {/* Budget Items */}
        {budgetsWithSpent.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Budgets</Text>
            {budgetsWithSpent.map((budget) => {
              const cat = EXPENSE_CATEGORIES.find(c => c.id === budget.categoryId);
              const progress = budget.actualSpent / budget.amount;
              const isOver = progress >= BUDGET_THRESHOLDS.danger;
              const isWarning = !isOver && progress >= BUDGET_THRESHOLDS.warning;
              const remaining = budget.amount - budget.actualSpent;

              return (
                <GlassCard
                  key={budget.id}
                  style={[styles.budgetCard, isOver && styles.budgetCardOver]}
                  padding={Spacing.base}
                >
                  <View style={styles.budgetHeader}>
                    <View style={[styles.budgetIcon, { backgroundColor: `${cat?.color ?? Colors.primary}20` }]}>
                      <MaterialIcons name={(cat?.icon ?? 'category') as any} size={18} color={cat?.color ?? Colors.primary} />
                    </View>
                    <View style={styles.budgetInfo}>
                      <Text style={styles.budgetName}>{cat?.name ?? budget.categoryId}</Text>
                      <Text style={styles.budgetAmounts}>
                        {APP_CONFIG.currency}{budget.actualSpent.toLocaleString('en-IN')} / {APP_CONFIG.currency}{budget.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.budgetRight}>
                      {isOver ? (
                        <View style={styles.overBadge}>
                          <Text style={styles.overBadgeText}>Over</Text>
                        </View>
                      ) : isWarning ? (
                        <View style={styles.warningBadge}>
                          <Text style={styles.warningBadgeText}>Alert</Text>
                        </View>
                      ) : null}
                      <Pressable
                        onPress={() => handleDelete(budget.id, cat?.name ?? budget.categoryId)}
                        hitSlop={8}
                      >
                        <MaterialIcons name="delete-outline" size={18} color={Colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>

                  <ProgressBar progress={Math.min(progress, 1)} height={8} />

                  <View style={styles.budgetFooter}>
                    <Text style={styles.budgetPct}>{(Math.min(progress, 1) * 100).toFixed(0)}% used</Text>
                    <Text style={[styles.budgetRemaining, { color: remaining < 0 ? Colors.error : Colors.success }]}>
                      {remaining < 0 ? 'Over by ' : 'Remaining: '}
                      {APP_CONFIG.currency}{Math.abs(remaining).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="account-balance"
            title="No Budgets Set"
            subtitle="Create budgets for your spending categories to track your expenses better"
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Category Budget</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Select Category</Text>
            <ScrollView style={styles.categoryScroll} showsVerticalScrollIndicator={false}>
              {EXPENSE_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.categoryOption, selectedCategory === cat.id && styles.categoryOptionSelected]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <View style={[styles.catIcon, { backgroundColor: `${cat.color}20` }]}>
                    <MaterialIcons name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <Text style={[styles.catName, selectedCategory === cat.id && styles.catNameSelected]}>
                    {cat.name}
                  </Text>
                  {selectedCategory === cat.id ? (
                    <MaterialIcons name="check" size={16} color={Colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Budget Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder="Enter amount"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddBudget}>
              <Text style={styles.saveBtnText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full, height: 40,
  },
  addBtnText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semiBold },

  overviewCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  overviewRow: { flexDirection: 'row' },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 4 },
  overviewValue: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, color: Colors.text },
  overviewDivider: { width: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.sm },

  section: { paddingHorizontal: Spacing.base },
  sectionTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.semiBold, color: Colors.text, marginBottom: Spacing.md },

  budgetCard: { marginBottom: Spacing.md, gap: Spacing.md },
  budgetCardOver: { borderColor: `${Colors.error}40` },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  budgetIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  budgetInfo: { flex: 1 },
  budgetName: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.text },
  budgetAmounts: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginTop: 1 },
  budgetRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  overBadge: { backgroundColor: Colors.errorBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.xs },
  overBadgeText: { fontSize: Fonts.sizes.xs, color: Colors.error, fontWeight: Fonts.weights.bold },
  warningBadge: { backgroundColor: Colors.warningBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.xs },
  warningBadgeText: { fontSize: Fonts.sizes.xs, color: Colors.warning, fontWeight: Fonts.weights.bold },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  budgetPct: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  budgetRemaining: { fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.semiBold },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surfaceElevated, borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl, padding: Spacing.xl, maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  inputLabel: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, fontWeight: Fonts.weights.medium },
  categoryScroll: { maxHeight: 240, marginBottom: Spacing.base },
  categoryOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg, marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  categoryOptionSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
  catIcon: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontSize: Fonts.sizes.base, color: Colors.textSecondary },
  catNameSelected: { color: Colors.text, fontWeight: Fonts.weights.medium },
  amountInput: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md,
    color: Colors.text, fontSize: Fonts.sizes.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.text, fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.bold },
});
