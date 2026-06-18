import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSavings } from '@/hooks/useSavings';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppButton } from '@/components/ui/AppButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SavingsScreen() {
  const { goals, isLoading, deleteGoal, addToGoal } = useSavings();

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  const handleAddFunds = (id: string, title: string) => {
    Alert.prompt
      ? Alert.prompt('Add Funds', `How much to add to "${title}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: (v) => { if (v && !isNaN(parseFloat(v))) addToGoal(id, parseFloat(v)); } },
        ], 'plain-text', '', 'numeric')
      : Alert.alert('Add Funds', 'Enter amount in the add transaction screen', [
          { text: 'OK', onPress: () => addToGoal(id, 1000) },
        ]);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Goal', `Remove "${title}" savings goal?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading goals..." />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        {goals.length > 0 ? (
          <GlassCard style={styles.overviewCard} variant="elevated" padding={Spacing.base}>
            <Text style={styles.overviewTitle}>Total Progress</Text>
            <View style={styles.overviewAmounts}>
              <View>
                <Text style={styles.overviewLabel}>Saved</Text>
                <Text style={[styles.overviewValue, { color: Colors.success }]}>
                  {APP_CONFIG.currency}{totalSaved.toLocaleString('en-IN')}
                </Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={Colors.textMuted} />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.overviewLabel}>Target</Text>
                <Text style={styles.overviewValue}>
                  {APP_CONFIG.currency}{totalTarget.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
            <ProgressBar
              progress={totalTarget > 0 ? totalSaved / totalTarget : 0}
              color={Colors.success}
              height={10}
              showLabel
              label="Overall Progress"
            />
          </GlassCard>
        ) : null}

        {/* Add Goal Button */}
        <Pressable
          style={({ pressed }) => [styles.addCard, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/savings/add')}
        >
          <MaterialIcons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.addCardText}>Create New Savings Goal</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
        </Pressable>

        {/* Goals List */}
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.currentAmount / goal.targetAmount;
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000);
            const isCompleted = progress >= 1;

            return (
              <GlassCard
                key={goal.id}
                style={[styles.goalCard, isCompleted && styles.goalCompleted]}
                padding={Spacing.base}
              >
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                    <MaterialIcons name={goal.icon as any} size={22} color={goal.color} />
                  </View>
                  <View style={styles.goalInfo}>
                    <View style={styles.goalTitleRow}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      {isCompleted ? (
                        <View style={styles.completedBadge}>
                          <MaterialIcons name="check" size={12} color={Colors.success} />
                          <Text style={styles.completedText}>Done!</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.goalDate}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Goal date passed'}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDelete(goal.id, goal.title)} hitSlop={8}>
                    <MaterialIcons name="delete-outline" size={18} color={Colors.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.goalAmounts}>
                  <Text style={styles.goalCurrentAmount}>
                    {APP_CONFIG.currency}{goal.currentAmount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.goalTargetAmount}>
                    / {APP_CONFIG.currency}{goal.targetAmount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.goalPct, { color: goal.color }]}>
                    {(progress * 100).toFixed(0)}%
                  </Text>
                </View>

                <ProgressBar progress={progress} color={goal.color} height={10} />

                {!isCompleted ? (
                  <Pressable
                    style={[styles.addFundsBtn, { backgroundColor: `${goal.color}20`, borderColor: `${goal.color}40` }]}
                    onPress={() => handleAddFunds(goal.id, goal.title)}
                  >
                    <MaterialIcons name="add" size={14} color={goal.color} />
                    <Text style={[styles.addFundsText, { color: goal.color }]}>Add Funds</Text>
                  </Pressable>
                ) : null}
              </GlassCard>
            );
          })
        ) : (
          <EmptyState
            icon="savings"
            title="No Savings Goals"
            subtitle="Create your first savings goal and start building your financial future"
            action={
              <AppButton
                title="Create Goal"
                onPress={() => router.push('/savings/add')}
                variant="primary"
                icon="add"
              />
            }
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 60 },

  overviewCard: { marginBottom: Spacing.base },
  overviewTitle: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.text, marginBottom: Spacing.md },
  overviewAmounts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  overviewLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginBottom: 2 },
  overviewValue: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },

  addCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.xl, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  addCardText: { flex: 1, fontSize: Fonts.sizes.base, color: Colors.primary, fontWeight: Fonts.weights.medium },

  goalCard: { marginBottom: Spacing.md, gap: Spacing.md },
  goalCompleted: { borderColor: `${Colors.success}40` },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  goalIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  goalInfo: { flex: 1 },
  goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  goalTitle: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.text },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full,
  },
  completedText: { fontSize: Fonts.sizes.xs, color: Colors.success, fontWeight: Fonts.weights.bold },
  goalDate: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  goalAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  goalCurrentAmount: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  goalTargetAmount: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  goalPct: { marginLeft: 'auto', fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  addFundsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1,
    marginTop: Spacing.xs,
  },
  addFundsText: { fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semiBold },
});
