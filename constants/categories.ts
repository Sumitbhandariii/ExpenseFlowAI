export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#F59E0B', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'directions-car', color: '#3B82F6', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#8B5CF6', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'local-hospital', color: '#EF4444', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#10B981', type: 'expense' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt', color: '#F97316', type: 'expense' },
  { id: 'rent', name: 'Rent & Housing', icon: 'home', color: '#06B6D4', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'flight', color: '#14B8A6', type: 'expense' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'subscriptions', color: '#A855F7', type: 'expense' },
  { id: 'insurance', name: 'Insurance', icon: 'security', color: '#64748B', type: 'expense' },
  { id: 'other_expense', name: 'Other', icon: 'more-horiz', color: '#6B7280', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: 'account-balance-wallet', color: '#10B981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#00BCD4', type: 'income' },
  { id: 'business', name: 'Business', icon: 'business', color: '#7C3AED', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#3B82F6', type: 'income' },
  { id: 'rental', name: 'Rental', icon: 'home', color: '#F59E0B', type: 'income' },
  { id: 'gift', name: 'Gift', icon: 'card-giftcard', color: '#EC4899', type: 'income' },
  { id: 'refund', name: 'Refund', icon: 'refresh', color: '#14B8A6', type: 'income' },
  { id: 'other_income', name: 'Other', icon: 'attach-money', color: '#6B7280', type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === id);
};
