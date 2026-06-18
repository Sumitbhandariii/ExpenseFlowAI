import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Budget } from '@/types';
import StorageService from '@/services/storage';

interface BudgetContextType {
  budgets: Budget[];
  isLoading: boolean;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateSpent: (categoryId: string, month: string, spent: number) => void;
  getBudgetForCategory: (categoryId: string, month: string) => Budget | undefined;
}

export const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const MOCK_BUDGETS: Budget[] = [
  { id: 'b1', categoryId: 'food', amount: 8000, month: new Date().toISOString().slice(0, 7), spent: 4200 },
  { id: 'b2', categoryId: 'transport', amount: 3000, month: new Date().toISOString().slice(0, 7), spent: 1800 },
  { id: 'b3', categoryId: 'shopping', amount: 5000, month: new Date().toISOString().slice(0, 7), spent: 3500 },
  { id: 'b4', categoryId: 'entertainment', amount: 4000, month: new Date().toISOString().slice(0, 7), spent: 5500 },
  { id: 'b5', categoryId: 'health', amount: 3000, month: new Date().toISOString().slice(0, 7), spent: 2100 },
  { id: 'b6', categoryId: 'utilities', amount: 4000, month: new Date().toISOString().slice(0, 7), spent: 2800 },
];

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await StorageService.get<Budget[]>(StorageService.KEYS.BUDGETS);
      if (stored && stored.length > 0) {
        setBudgets(stored);
      } else {
        setBudgets(MOCK_BUDGETS);
        await StorageService.set(StorageService.KEYS.BUDGETS, MOCK_BUDGETS);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const save = async (items: Budget[]) => {
    await StorageService.set(StorageService.KEYS.BUDGETS, items);
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = { ...budget, id: Date.now().toString(), spent: 0 };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await save(updated);
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates } : b);
    setBudgets(updated);
    await save(updated);
  };

  const deleteBudget = async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await save(updated);
  };

  const updateSpent = useCallback((categoryId: string, month: string, spent: number) => {
    setBudgets(prev =>
      prev.map(b => b.categoryId === categoryId && b.month === month ? { ...b, spent } : b)
    );
  }, []);

  const getBudgetForCategory = useCallback((categoryId: string, month: string) => {
    return budgets.find(b => b.categoryId === categoryId && b.month === month);
  }, [budgets]);

  return (
    <BudgetContext.Provider value={{ budgets, isLoading, addBudget, updateBudget, deleteBudget, updateSpent, getBudgetForCategory }}>
      {children}
    </BudgetContext.Provider>
  );
}
