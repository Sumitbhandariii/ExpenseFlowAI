import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { SavingsGoal } from '@/types';
import StorageService from '@/services/storage';

interface SavingsContextType {
  goals: SavingsGoal[];
  isLoading: boolean;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addToGoal: (id: string, amount: number) => Promise<void>;
}

export const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

const MOCK_GOALS: SavingsGoal[] = [
  { id: 'g1', title: 'Emergency Fund', targetAmount: 200000, currentAmount: 75000, targetDate: '2025-12-31', icon: 'security', color: '#10B981', createdAt: new Date().toISOString() },
  { id: 'g2', title: 'New Laptop', targetAmount: 80000, currentAmount: 35000, targetDate: '2025-06-30', icon: 'laptop', color: '#7C3AED', createdAt: new Date().toISOString() },
  { id: 'g3', title: 'Vacation', targetAmount: 150000, currentAmount: 20000, targetDate: '2025-09-01', icon: 'flight', color: '#00BCD4', createdAt: new Date().toISOString() },
  { id: 'g4', title: 'New Car', targetAmount: 800000, currentAmount: 120000, targetDate: '2026-12-31', icon: 'directions-car', color: '#F59E0B', createdAt: new Date().toISOString() },
];

export function SavingsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await StorageService.get<SavingsGoal[]>(StorageService.KEYS.SAVINGS_GOALS);
      if (stored && stored.length > 0) {
        setGoals(stored);
      } else {
        setGoals(MOCK_GOALS);
        await StorageService.set(StorageService.KEYS.SAVINGS_GOALS, MOCK_GOALS);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const save = async (items: SavingsGoal[]) => {
    await StorageService.set(StorageService.KEYS.SAVINGS_GOALS, items);
  };

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = { ...goal, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...goals, newGoal];
    setGoals(updated);
    await save(updated);
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    await save(updated);
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await save(updated);
  };

  const addToGoal = async (id: string, amount: number) => {
    const updated = goals.map(g =>
      g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
    );
    setGoals(updated);
    await save(updated);
  };

  return (
    <SavingsContext.Provider value={{ goals, isLoading, addGoal, updateGoal, deleteGoal, addToGoal }}>
      {children}
    </SavingsContext.Provider>
  );
}
