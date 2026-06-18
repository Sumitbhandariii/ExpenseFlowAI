import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: '@expenseflow_transactions',
  BUDGETS: '@expenseflow_budgets',
  SAVINGS_GOALS: '@expenseflow_savings_goals',
  USER_PROFILE: '@expenseflow_user_profile',
  AI_MESSAGES: '@expenseflow_ai_messages',
  SETTINGS: '@expenseflow_settings',
};

export const StorageService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Storage set error');
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      console.error('Storage remove error');
    }
  },

  KEYS,
};

export default StorageService;
