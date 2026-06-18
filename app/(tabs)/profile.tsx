import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { useSavings } from '@/hooks/useSavings';
import { useBudget } from '@/hooks/useBudget';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { GlassCard } from '@/components/ui/GlassCard';
import { Image } from 'expo-image';

interface SettingItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
}

function SettingItem({ icon, iconColor, iconBg, label, value, onPress, rightContent, showChevron = true }: SettingItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingItem, pressed && onPress && styles.settingPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      </View>
      {rightContent ? rightContent : null}
      {showChevron && onPress && !rightContent ? (
        <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { transactions, getMonthlyStats } = useTransactions();
  const { goals } = useSavings();
  const { budgets } = useBudget();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const stats = getMonthlyStats();
  const totalTransactions = transactions.length;
  const totalGoals = goals.length;

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all transactions, budgets, and savings goals? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Success', 'Data cleared successfully') },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export feature coming soon. Connect Supabase to enable cloud backup and export.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard} variant="elevated" padding={Spacing.xl}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={36} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>User</Text>
              <Text style={styles.profileEmail}>{APP_CONFIG.supportEmail}</Text>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="star" size={12} color={Colors.warning} />
                <Text style={styles.premiumText}>Premium User</Text>
              </View>
            </View>
            <Pressable style={styles.editBtn}>
              <MaterialIcons name="edit" size={18} color={Colors.accent} />
            </Pressable>
          </View>
        </GlassCard>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Transactions', value: totalTransactions.toString(), icon: 'swap-horiz', color: Colors.primary },
            { label: 'Savings Goals', value: totalGoals.toString(), icon: 'flag', color: Colors.success },
            { label: 'This Month', value: `${APP_CONFIG.currency}${(stats.totalExpenses / 1000).toFixed(0)}K`, icon: 'calendar-today', color: Colors.expense },
            { label: 'Budgets Set', value: budgets.length.toString(), icon: 'account-balance', color: Colors.accent },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statCard} padding={Spacing.md}>
              <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}20` }]}>
                <MaterialIcons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* AI Advisor Quick Access */}
        <GlassCard style={styles.aiCard} variant="highlight" padding={Spacing.base} onPress={() => router.push('/ai-advisor')}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconWrap}>
              <MaterialIcons name="auto-awesome" size={24} color={Colors.accent} />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>AI Financial Advisor</Text>
              <Text style={styles.aiSubtitle}>Get personalized insights powered by Gemini AI</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.accent} />
          </View>
        </GlassCard>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <GlassCard padding={0} style={styles.settingsCard}>
          <SettingItem
            icon="notifications"
            iconColor={Colors.warning}
            iconBg={Colors.warningBg}
            label="Push Notifications"
            onPress={undefined}
            showChevron={false}
            rightContent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.surfaceElevated, true: `${Colors.primary}70` }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
              />
            }
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="fingerprint"
            iconColor={Colors.accent}
            iconBg={Colors.infoBg}
            label="Biometric Lock"
            value="Coming soon"
            showChevron={false}
            rightContent={
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: Colors.surfaceElevated, true: `${Colors.primary}70` }}
                thumbColor={biometricEnabled ? Colors.primary : Colors.textMuted}
              />
            }
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="language"
            iconColor={Colors.primary}
            iconBg={`${Colors.primary}20`}
            label="Currency"
            value={`${APP_CONFIG.currency} INR`}
            onPress={() => Alert.alert('Currency', 'Multi-currency support coming soon!')}
          />
        </GlassCard>

        {/* Data & Backup */}
        <Text style={styles.sectionTitle}>Data & Backup</Text>
        <GlassCard padding={0} style={styles.settingsCard}>
          <SettingItem
            icon="cloud-upload"
            iconColor={Colors.info}
            iconBg={Colors.infoBg}
            label="Backup to Cloud"
            value="Connect Supabase to enable"
            onPress={handleExportData}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="download"
            iconColor={Colors.success}
            iconBg={Colors.successBg}
            label="Export Data"
            value="CSV / JSON format"
            onPress={handleExportData}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="delete-forever"
            iconColor={Colors.error}
            iconBg={Colors.errorBg}
            label="Clear All Data"
            value="Cannot be undone"
            onPress={handleClearData}
          />
        </GlassCard>

        {/* About & Legal */}
        <Text style={styles.sectionTitle}>About</Text>
        <GlassCard padding={0} style={styles.settingsCard}>
          <SettingItem
            icon="info"
            iconColor={Colors.primary}
            iconBg={`${Colors.primary}20`}
            label="App Version"
            value={`v${APP_CONFIG.version}`}
            showChevron={false}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="privacy-tip"
            iconColor={Colors.accent}
            iconBg={Colors.infoBg}
            label="Privacy Policy"
            onPress={() => Linking.openURL(APP_CONFIG.privacyPolicyUrl)}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="description"
            iconColor={Colors.textSecondary}
            iconBg={Colors.surfaceElevated}
            label="Terms & Conditions"
            onPress={() => Linking.openURL(APP_CONFIG.termsUrl)}
          />
          <View style={styles.settingDivider} />
          <SettingItem
            icon="email"
            iconColor={Colors.success}
            iconBg={Colors.successBg}
            label="Contact Support"
            value={APP_CONFIG.supportEmail}
            onPress={() => Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`)}
          />
        </GlassCard>

        {/* App Name */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>{APP_CONFIG.name}</Text>
          <Text style={styles.footerSub}>Powered by Gemini AI • Made with ♥</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 100 },
  headerTitle: { fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold, color: Colors.text, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.base },

  profileCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${Colors.primary}25`, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  profileEmail: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginTop: 2 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.warningBg, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, marginTop: 6, alignSelf: 'flex-start',
  },
  premiumText: { fontSize: Fonts.sizes.xs, color: Colors.warning, fontWeight: Fonts.weights.semiBold },
  editBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base,
    gap: Spacing.sm, marginBottom: Spacing.base,
  },
  statCard: { width: '47.5%', alignItems: 'center', gap: Spacing.xs },
  statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, color: Colors.text },
  statLabel: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },

  aiCard: { marginHorizontal: Spacing.base, marginBottom: Spacing.base },
  aiCardContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiIconWrap: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: `${Colors.accent}20`, alignItems: 'center', justifyContent: 'center' },
  aiText: { flex: 1 },
  aiTitle: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semiBold, color: Colors.text },
  aiSubtitle: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginTop: 2 },

  sectionTitle: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semiBold, color: Colors.textSecondary, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, marginTop: Spacing.md },
  settingsCard: { marginHorizontal: Spacing.base, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, gap: Spacing.md, minHeight: 56 },
  settingPressed: { backgroundColor: Colors.surfaceElevated },
  settingIcon: { width: 36, height: 36, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: Fonts.sizes.base, color: Colors.text, fontWeight: Fonts.weights.medium },
  settingValue: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, marginTop: 2 },
  settingDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 52 + Spacing.base },

  footer: { alignItems: 'center', paddingVertical: Spacing.xl },
  footerTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.textMuted },
  footerSub: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, marginTop: 4 },
});
