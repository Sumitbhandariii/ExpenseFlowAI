import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, MonthlyStats, CategoryBreakdown } from '@/types';
import StorageService from '@/services/storage';
import { getCategoryById } from '@/constants/categories';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getMonthlyStats: (month?: string) => MonthlyStats;
  getCategoryBreakdown: (type: 'income' | 'expense', month?: string) => CategoryBreakdown[];
  getTransactionsByMonth: (month: string) => Transaction[];
  refreshTransactions: () => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 85000, category: 'salary', description: 'Monthly Salary', date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '2', type: 'expense', amount: 12500, category: 'rent', description: 'House Rent', date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '3', type: 'expense', amount: 4200, category: 'food', description: 'Grocery & Dining', date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '4', type: 'expense', amount: 1800, category: 'transport', description: 'Uber & Metro', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '5', type: 'expense', amount: 3500, category: 'shopping', description: 'Amazon Purchase', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '6', type: 'income', amount: 15000, category: 'freelance', description: 'Freelance Project', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '7', type: 'expense', amount: 999, category: 'subscriptions', description: 'Netflix + Spotify', date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '8', type: 'expense', amount: 2100, category: 'health', description: 'Doctor + Medicine', date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '9', type: 'expense', amount: 5500, category: 'entertainment', description: 'Movie + Dinner', date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
  { id: '10', type: 'expense', amount: 2800, category: 'utilities', description: 'Electricity + Internet', date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    const stored = await StorageService.get<Transaction[]>(StorageService.KEYS.TRANSACTIONS);
    if (stored && stored.length > 0) {
      setTransactions(stored);
    } else {
      setTransactions(MOCK_TRANSACTIONS);
      await StorageService.set(StorageService.KEYS.TRANSACTIONS, MOCK_TRANSACTIONS);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const saveTransactions = async (txns: Transaction[]) => {
    await StorageService.set(StorageService.KEYS.TRANSACTIONS, txns);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const getTransactionsByMonth = useCallback((month: string): Transaction[] => {
    return transactions.filter(t => t.date.startsWith(month));
  }, [transactions]);

  const getMonthlyStats = useCallback((month?: string): MonthlyStats => {
    const m = month ?? getCurrentMonth();
    const monthlyTxns = getTransactionsByMonth(m);
    const totalIncome = monthlyTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthlyTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      month: m,
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      transactionCount: monthlyTxns.length,
    };
  }, [getTransactionsByMonth]);

  const getCategoryBreakdown = useCallback((type: 'income' | 'expense', month?: string): CategoryBreakdown[] => {
    const m = month ?? getCurrentMonth();
    const monthlyTxns = getTransactionsByMonth(m).filter(t => t.type === type);
    const total = monthlyTxns.reduce((s, t) => s + t.amount, 0);
    
    const grouped: Record<string, number> = {};
    const counts: Record<string, number> = {};
    monthlyTxns.forEach(t => {
      grouped[t.category] = (grouped[t.category] ?? 0) + t.amount;
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    });

    return Object.entries(grouped)
      .map(([catId, catTotal]) => {
        const category = getCategoryById(catId);
        return {
          categoryId: catId,
          categoryName: category?.name ?? catId,
          total: catTotal,
          percentage: total > 0 ? (catTotal / total) * 100 : 0,
          color: category?.color ?? '#6B7280',
          count: counts[catId] ?? 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [getTransactionsByMonth]);

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getMonthlyStats,
      getCategoryBreakdown,
      getTransactionsByMonth,
      refreshTransactions: loadTransactions,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}
