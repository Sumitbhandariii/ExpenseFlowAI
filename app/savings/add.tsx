import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSavings } from '@/hooks/useSavings';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { AppButton } from '@/components/ui/AppButton';

const GOAL_ICONS = [
  { id: 'savings', label: 'Savings' },
  { id: 'home', label: 'Home' },
  { id: 'directions-car', label: 'Car' },
  { id: 'flight', label: 'Travel' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'school', label: 'Education' },
  { id: 'security', label: 'Emergency' },
  { id: 'shopping-bag', label: 'Shopping' },
  { id: 'favorite', label: 'Wedding' },
  { id: 'child-care', label: 'Baby' },
  { id: 'fitness-center', label: 'Fitness' },
  { id: 'business', label: 'Business' },
];

const GOAL_COLORS = ['#10B981', '#7C3AED', '#00BCD4', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#F97316'];

export default function AddSavingsGoalScreen() {
  const { addGoal } = useSavings();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedIcon, setSelectedIcon] = useState('savings');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Missing Title', 'Please enter a goal name'); return; }
    if (!targetAmount || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount');
      return;
    }
    setSaving(true);
    try {
      await addGoal({
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate,
        icon: selectedIcon,
        color: selectedColor,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Goal Name</Text>
        <TextInput
          style={styles.input} value={title} onChangeText={setTitle}
          placeholder="e.g., Emergency Fund" placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Target Amount ({APP_CONFIG.currency})</Text>
        <TextInput
          style={styles.input} value={targetAmount} onChangeText={setTargetAmount}
          placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Already Saved ({APP_CONFIG.currency}) - Optional</Text>
        <TextInput
          style={styles.input} value={currentAmount} onChangeText={setCurrentAmount}
          placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Target Date</Text>
        <TextInput
          style={styles.input} value={targetDate} onChangeText={setTargetDate}
          placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Choose Icon</Text>
        <View style={styles.iconGrid}>
          {GOAL_ICONS.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.iconOption, selectedIcon === item.id && styles.iconOptionSelected]}
              onPress={() => setSelectedIcon(item.id)}
            >
              <MaterialIcons name={item.id as any} size={22} color={selectedIcon === item.id ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.iconLabel, selectedIcon === item.id && { color: Colors.primary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Choose Color</Text>
        <View style={styles.colorRow}>
          {GOAL_COLORS.map((color) => (
            <Pressable
              key={color}
              style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color ? <MaterialIcons name="check" size={14} color={Colors.text} /> : null}
            </Pressable>
          ))}
        </View>

        <AppButton
          title={saving ? 'Creating...' : 'Create Savings Goal'}
          onPress={handleSave}
          loading={saving}
          fullWidth size="lg" icon="flag"
          style={styles.saveBtn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
  label: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary, fontWeight: Fonts.weights.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.base },
  input: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, padding: Spacing.md,
    color: Colors.text, fontSize: Fonts.sizes.base, borderWidth: 1, borderColor: Colors.border,
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  iconOption: {
    width: '22%', alignItems: 'center', gap: 4, paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderLight,
  },
  iconOptionSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
  iconLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  colorRow: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  colorDot: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.text, transform: [{ scale: 1.1 }] },
  saveBtn: { marginTop: Spacing.xl },
});
