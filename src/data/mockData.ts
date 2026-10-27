import { CategoryBudget, CategoryId, CategoryInfo, DaySpend, Transaction, UserProfile, SavingsCategory, SavingsGoal } from '../types';

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

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [];

export interface SavingsCategoryInfo {
  id: SavingsCategory;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const SAVINGS_CATEGORIES: Record<SavingsCategory, SavingsCategoryInfo> = {
  emergency: {
    id: 'emergency',
    name: 'Dana Darurat',
    icon: '🛡️',
    color: '#006948',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#006948] dark:text-emerald-400',
  },
  gadget: {
    id: 'gadget',
    name: 'Gadget & Elektronik',
    icon: '💻',
    color: '#2563eb',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  },
  holiday: {
    id: 'holiday',
    name: 'Liburan & Healing',
    icon: '✈️',
    color: '#0284c7',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  },
  vehicle: {
    id: 'vehicle',
    name: 'Kendaraan & Servis',
    icon: '🚗',
    color: '#d97706',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  },
  home: {
    id: 'home',
    name: 'Rumah & Properti',
    icon: '🏠',
    color: '#7c3aed',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  },
  education: {
    id: 'education',
    name: 'Pendidikan & Kursus',
    icon: '🎓',
    color: '#0891b2',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
  },
  investment: {
    id: 'investment',
    name: 'Investasi & Usaha',
    icon: '📈',
    color: '#059669',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
  },
  other: {
    id: 'other',
    name: 'Target Lainnya',
    icon: '✨',
    color: '#db2777',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
  },
};

