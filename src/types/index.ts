export type TransactionType = 'expense' | 'income';

export type CategoryId =
  | 'food'
  | 'transport'
  | 'groceries'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'income'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  categoryName: string;
  dateStr: string; // e.g. "Hari ini, 12:45" or "Kemarin, 19:15"
  dateIso: string; // YYYY-MM-DD
  paymentMethod: string;
  note?: string;
  userEmail?: string;
}

export interface DaySpend {
  dayKey: 'Sen' | 'Sel' | 'Rab' | 'Kam' | 'Jum' | 'Sab' | 'Min';
  fullName: string;
  amount: number;
  isMax?: boolean;
  isToday?: boolean;
  isUpcoming?: boolean;
}

export interface CategoryBudget {
  id: CategoryId;
  name: string;
  spent: number;
  limit: number;
  icon: string;
  color: string;
}

export interface UserProfile {
  name: string;
  greeting: string;
  avatarUrl: string;
  totalWeeklyBudget: number;
  currentWeekText: string;
  email?: string;
}
