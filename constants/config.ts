// ExpenseFlow AI - App Configuration
export const APP_CONFIG = {
  name: 'ExpenseFlow AI',
  version: '1.0.0',
  packageName: 'com.expenseflowai.manager',
  supportEmail: 'support@expenseflowai.com',
  privacyPolicyUrl: 'https://expenseflowai.com/privacy',
  termsUrl: 'https://expenseflowai.com/terms',
  currency: '₹',
  currencyCode: 'INR',
};

// Gemini AI Configuration
export const AI_CONFIG = {
  apiKey: 'AIzaSyC7Widicgo-woyWRJNx73WEXDJtzzL-Ktc',
  model: 'gemini-1.5-flash',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  maxTokens: 1024,
};

// AdMob Test IDs (replace with real IDs for production)
export const ADMOB_CONFIG = {
  // Test App ID
  appId: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511',
  },
  // Test Ad Unit IDs
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
  nativeAdvanced: {
    android: 'ca-app-pub-3940256099942544/2247696110',
    ios: 'ca-app-pub-3940256099942544/3986624511',
  },
};

// Budget alert thresholds
export const BUDGET_THRESHOLDS = {
  warning: 0.8,  // 80% of budget used
  danger: 1.0,   // 100% of budget used
};
