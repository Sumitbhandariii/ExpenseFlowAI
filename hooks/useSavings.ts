import { useContext } from 'react';
import { SavingsContext } from '@/contexts/SavingsContext';

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context) throw new Error('useSavings must be used within SavingsProvider');
  return context;
}
