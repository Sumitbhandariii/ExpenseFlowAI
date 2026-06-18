import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionType } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { AppButton } from '@/components/ui/AppButton';

export default function AddTransactionScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<TransactionType>((params.type as TransactionType) ?? 'expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please add a description for this transaction');
      return;
    }
    if (!category) {
      Alert.alert('Select Category', 'Please select a category for this transaction');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description: description.trim(),
        category,
        date,
        note: note.trim() || undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <Pressable
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
            onPress={() => { setType('expense'); setCategory(''); }}
          >
            <MaterialIcons name="arrow-upward" size={16} color={type === 'expense' ? Colors.text : Colors.textMuted} />
            <Text style={[styles.typeBtnText, type === 'expense' && { color: Colors.text }]}>Expense</Text>
          </Pressable>
          <Pressable
            style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
            onPress={() => { setType('income'); setCategory(''); }}
          >
            <MaterialIcons name="arrow-downward" size={16} color={type === 'income' ? Colors.text : Colors.textMuted} />
            <Text style={[styles.typeBtnText, type === 'income' && { color: Colors.text }]}>Income</Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountSection}>
          <Text style={styles.currencySymbol}>{APP_CONFIG.currency}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.catOption, category === cat.id && styles.catOptionSelected, { borderColor: category === cat.id ? cat.color : Colors.borderLight }]}
                onPress={() => setCategory(cat.id)}
              >
                <View style={[styles.catOptionIcon, { backgroundColor: `${cat.color}25` }]}>
                  <MaterialIcons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text style={[styles.catOptionText, category === cat.id && { color: cat.color }]} numberOfLines={1}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <AppButton
          title={saving ? 'Saving...' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          icon={type === 'income' ? 'arrow-downward' : 'arrow-upward'}
          style={[styles.saveBtn, { backgroundColor: type === 'income' ? Colors.income : Colors.error }]}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base },

  typeToggle: {
    flexDirection: 'row', backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl, padding: 4, marginBottom: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: Radius.lg,
  },
  typeBtnExpense: { backgroundColor: Colors.expense },
  typeBtnIncome: { backgroundColor: Colors.income },
  typeBtnText: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.textMuted },

  amountSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl, gap: Spacing.sm,
  },
  currencySymbol: { fontSize: Fonts.sizes.xxxl, fontWeight: Fonts.weights.bold, color: Colors.textSecondary },
  amountInput: {
    fontSize: Fonts.sizes.hero, fontWeight: Fonts.weights.extraBold, color: Colors.text,
    minWidth: 120, textAlign: 'center',
  },

  inputGroup: { marginBottom: Spacing.base },
  label: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: Fonts.weights.semiBold, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md,
    color: Colors.text, fontSize: Fonts.sizes.base, borderWidth: 1, borderColor: Colors.border,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  catOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg,
    borderWidth: 1, minWidth: '45%', flex: 1,
  },
  catOptionSelected: { backgroundColor: Colors.surfaceElevated },
  catOptionIcon: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  catOptionText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, flex: 1 },

  saveBtn: { borderRadius: Radius.lg, marginTop: Spacing.base },
});
