// ExpenseFlow AI - Design System
export const Colors = {
  // Backgrounds
  background: '#08081A',
  surface: '#0F0F2A',
  surfaceElevated: '#161635',
  surfaceCard: '#1A1A3E',
  overlay: 'rgba(8,8,26,0.85)',

  // Brand
  primary: '#7C3AED',
  primaryLight: '#9D5BFF',
  primaryDark: '#5B21B6',
  accent: '#00BCD4',
  accentLight: '#26D0E0',
  accentDark: '#0097A7',

  // Gradient stops
  gradientPrimary: ['#7C3AED', '#00BCD4'] as const,
  gradientDark: ['#0F0F2A', '#08081A'] as const,
  gradientCard: ['#1A1A3E', '#0F0F2A'] as const,
  gradientPurple: ['#7C3AED', '#5B21B6'] as const,
  gradientCyan: ['#00BCD4', '#0097A7'] as const,

  // Text
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#08081A',

  // Semantic
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.15)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.15)',
  error: '#EF4444',
  errorBg: 'rgba(239,68,68,0.15)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.15)',

  // UI
  border: 'rgba(124,58,237,0.2)',
  borderLight: 'rgba(255,255,255,0.08)',
  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(255,255,255,0.1)',
  divider: 'rgba(255,255,255,0.06)',

  // Income/Expense
  income: '#10B981',
  incomeBg: 'rgba(16,185,129,0.12)',
  expense: '#EF4444',
  expenseBg: 'rgba(239,68,68,0.12)',

  // Tab bar
  tabBar: '#0A0A20',
  tabBarBorder: 'rgba(124,58,237,0.3)',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
    hero: 42,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  section: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};
