import { CategoryBudget, CategoryId, CategoryInfo, DaySpend, Transaction, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Rian',
  greeting: 'Halo, Rian! 👋',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  totalWeeklyBudget: 2000000,
  currentWeekText: 'Mgg 4 • 24–30 Mar',
};

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: {
    id: 'food',
    name: 'Makanan & Minuman',
    icon: '🍔',
    bgColor: 'bg-[#fef3c7]',
    textColor: 'text-[#b45309]',
  },
  transport: {
    id: 'transport',
    name: 'Transportasi',
    icon: '🛵',
    bgColor: 'bg-[#e0f2fe]',
    textColor: 'text-[#0369a1]',
  },
  groceries: {
    id: 'groceries',
    name: 'Kebutuhan Rumah',
    icon: '🛒',
    bgColor: 'bg-[#ede9fe]',
    textColor: 'text-[#6d28d9]',
  },
  bills: {
    id: 'bills',
    name: 'Tagihan & Utilitas',
    icon: '⚡',
    bgColor: 'bg-[#fee2e2]',
    textColor: 'text-[#b91c1c]',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Hiburan & Hobi',
    icon: '🎬',
    bgColor: 'bg-[#fce7f3]',
    textColor: 'text-[#be185d]',
  },
  health: {
    id: 'health',
    name: 'Kesehatan',
    icon: '💊',
    bgColor: 'bg-[#ccfbf1]',
    textColor: 'text-[#0f766e]',
  },
  shopping: {
    id: 'shopping',
    name: 'Belanja & Gaya Hidup',
    icon: '🛍️',
    bgColor: 'bg-[#ffedd5]',
    textColor: 'text-[#c2410c]',
  },
  income: {
    id: 'income',
    name: 'Pendapatan',
    icon: '💼',
    bgColor: 'bg-[#dcfce7]',
    textColor: 'text-[#15803d]',
  },
  other: {
    id: 'other',
    name: 'Lain-lain',
    icon: '🏷️',
    bgColor: 'bg-[#f1f5f9]',
    textColor: 'text-[#475569]',
  },
};

export const PAYMENT_METHODS = [
  'BCA QRIS',
  'GoPay',
  'OVO',
  'ShopeePay',
  'Mandiri Livin',
  'Kartu Debit',
  'Kartu Kredit',
  'Tunai',
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_DAILY_SPENDS: DaySpend[] = [
  { dayKey: 'Sen', fullName: 'Senin', amount: 0 },
  { dayKey: 'Sel', fullName: 'Selasa', amount: 0 },
  { dayKey: 'Rab', fullName: 'Rabu', amount: 0 },
  { dayKey: 'Kam', fullName: 'Kamis', amount: 0 },
  { dayKey: 'Jum', fullName: 'Jumat', amount: 0, isToday: true },
  { dayKey: 'Sab', fullName: 'Sabtu', amount: 0, isUpcoming: true },
  { dayKey: 'Min', fullName: 'Minggu', amount: 0, isUpcoming: true },
];

export const INITIAL_CATEGORY_BUDGETS: CategoryBudget[] = [
  {
    id: 'food',
    name: 'Makanan & Minuman',
    spent: 0,
    limit: 2000000,
    icon: '🍔',
    color: '#006948',
  },
  {
    id: 'groceries',
    name: 'Kebutuhan Rumah',
    spent: 0,
    limit: 600000,
    icon: '🛒',
    color: '#6d28d9',
  },
  {
    id: 'bills',
    name: 'Tagihan & Utilitas',
    spent: 0,
    limit: 450000,
    icon: '⚡',
    color: '#b91c1c',
  },
  {
    id: 'transport',
    name: 'Transportasi & Ojek',
    spent: 0,
    limit: 450000,
    icon: '🛵',
    color: '#0369a1',
  },
  {
    id: 'entertainment',
    name: 'Hiburan & Rekreasi',
    spent: 0,
    limit: 350000,
    icon: '🎬',
    color: '#be185d',
  },
];

