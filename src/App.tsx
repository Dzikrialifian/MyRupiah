import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_DAILY_SPENDS,
  INITIAL_CATEGORY_BUDGETS,
  INITIAL_SAVINGS_GOALS,
} from './data/mockData';
import {
  Transaction,
  UserProfile,
  CategoryBudget,
  DaySpend,
  SavingsGoal,
  ThemePreference,
} from './types';
import { Header } from './components/Header';
import { GreetingSection } from './components/GreetingSection';
import { WeeklyBudgetHeroCard } from './components/WeeklyBudgetHeroCard';
import { QuickStatsCards } from './components/QuickStatsCards';
import { DailySpendingChart } from './components/DailySpendingChart';
import { TipsCard } from './components/TipsCard';
import { SavingsSummaryCard } from './components/SavingsSummaryCard';
import { RecentTransactionsList } from './components/RecentTransactionsList';
import { BottomNavBar, ScreenTab } from './components/BottomNavBar';

// Screens
import { AuthScreen } from './components/screens/AuthScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SavingsScreen } from './components/screens/SavingsScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { AdviceScreen } from './components/screens/AdviceScreen';
import { AccountSettingsScreen } from './components/screens/AccountSettingsScreen';

// Modals
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { SavingsDepositModal } from './components/modals/SavingsDepositModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { TipsDetailModal } from './components/modals/TipsDetailModal';
import { WeekPickerModal } from './components/modals/WeekPickerModal';

// Google Workspace & Sheets Services
import { initAuth, googleSignIn, emailSignIn, emailSignUp, getAccessToken, logout } from './services/auth';
import {
  SyncStatus,
  getSavedSpreadsheetId,
  saveSpreadsheetId,
  getOrCreateSpreadsheet,
  syncAllTransactionsToSheet,
  importTransactionsFromSheet,
} from './services/sheetsService';

// Firebase Firestore Services
import {
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  fetchTransactionsFromFirestore,
  saveCategoryBudgetsToFirestore,
  fetchCategoryBudgetsFromFirestore,
  saveSavingsGoalToFirestore,
  deleteSavingsGoalFromFirestore,
  fetchSavingsGoalsFromFirestore,
} from './services/firebaseService';

export default function App() {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('myrupiah_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Persistence state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_user');
      if (saved) return JSON.parse(saved);
      return { ...INITIAL_USER, email: 'dzikrialifian@gmail.com', themePreference: 'system' };
    } catch {
      return { ...INITIAL_USER, email: 'dzikrialifian@gmail.com', themePreference: 'system' };
    }
  });

  // Dark mode theme preference state
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    try {
      const savedTheme = localStorage.getItem('myrupiah_theme') as ThemePreference;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        return savedTheme;
      }
      return user.themePreference || 'system';
    } catch {
      return 'system';
    }
  });

  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDarkModeActive = useMemo(() => {
    if (themePreference === 'dark') return true;
    if (themePreference === 'light') return false;
    return isSystemDark;
  }, [themePreference, isSystemDark]);

  // Apply dark class to documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDarkModeActive) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkModeActive]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isLegacyMock =
          Array.isArray(parsed) &&
          parsed.some((t: any) => t.id === 'trx-1' || t.id === 'trx-2' || t.id === 'trx-3');
        if (isLegacyMock) {
          localStorage.removeItem('myrupiah_transactions');
          return [];
        }
        return parsed;
      }
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_category_budgets');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORY_BUDGETS;
    } catch {
      return INITIAL_CATEGORY_BUDGETS;
    }
  });

  // Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_savings_goals');
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [dailySpends, setDailySpends] = useState<DaySpend[]>(INITIAL_DAILY_SPENDS);
  const [activeTab, setActiveTab] = useState<ScreenTab>('beranda');

  // Google & Firebase integration state
  const [googleEmail, setGoogleEmail] = useState<string | null>(user.email || null);
  const [googleUid, setGoogleUid] = useState<string | null>(() => {
    try {
      return localStorage.getItem('myrupiah_uid');
    } catch {
      return null;
    }
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    spreadsheetId: getSavedSpreadsheetId(),
    spreadsheetUrl: getSavedSpreadsheetId()
      ? `https://docs.google.com/spreadsheets/d/${getSavedSpreadsheetId()}`
      : null,
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  });

  // Modal open states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);

  // Savings Modal states
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_authenticated', String(isAuthenticated));
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_theme', themePreference);
    } catch {}
  }, [themePreference]);

  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_transactions', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_category_budgets', JSON.stringify(categoryBudgets));
    } catch {}
  }, [categoryBudgets]);

  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_savings_goals', JSON.stringify(savingsGoals));
    } catch {}
  }, [savingsGoals]);

  useEffect(() => {
    try {
      if (googleUid) {
        localStorage.setItem('myrupiah_uid', googleUid);
      } else {
        localStorage.removeItem('myrupiah_uid');
      }
    } catch {}
  }, [googleUid]);

  // Derived budget calculations
  const weeklyExpenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  const weeklySpent = useMemo(() => {
    return weeklyExpenseTransactions.reduce((s, t) => s + t.amount, 0);
  }, [weeklyExpenseTransactions]);

  // Today transactions (Hari ini)
  const todayTransactions = useMemo(() => {
    return transactions.filter((t) => t.dateStr.toLowerCase().includes('hari ini'));
  }, [transactions]);

  const todaySpent = useMemo(() => {
    return todayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [todayTransactions]);

  const todayCount = todayTransactions.length;
  const remainingBudget = Math.max(0, user.totalWeeklyBudget - weeklySpent);
  const daysRemaining = 3; // Jum, Sab, Min
  const dailyAllowance = Math.round(remainingBudget / daysRemaining);

  // Synchronize daily chart Friday (Jum) with today's spent
  useEffect(() => {
    setDailySpends((prev) =>
      prev.map((d) => {
        if (d.dayKey === 'Jum') {
          return { ...d, amount: todaySpent };
        }
        return d;
      })
    );
  }, [todaySpent]);

  // Helper: Load data from Firestore for a given user UID
  const loadUserFirestoreData = useCallback(async (uid: string, fallbackEmail?: string) => {
    try {
      // 1. Transactions
      const remoteTxs = await fetchTransactionsFromFirestore(uid);
      if (remoteTxs && remoteTxs.length > 0) {
        setTransactions(remoteTxs);
      }

      // 2. Profile & Theme
      const remoteProfile = await fetchUserProfileFromFirestore(uid);
      if (remoteProfile && remoteProfile.name) {
        setUser((prev) => ({
          ...prev,
          ...remoteProfile,
          email: remoteProfile.email || fallbackEmail || prev.email,
        }));
        if (remoteProfile.themePreference) {
          setThemePreference(remoteProfile.themePreference);
        }
      } else {
        await saveUserProfileToFirestore(uid, {
          ...user,
          email: fallbackEmail || user.email,
          themePreference,
        });
      }

      // 3. Budgets
      const remoteBudgets = await fetchCategoryBudgetsFromFirestore(uid);
      if (remoteBudgets && remoteBudgets.length > 0) {
        setCategoryBudgets(remoteBudgets);
      } else {
        await saveCategoryBudgetsToFirestore(uid, categoryBudgets);
      }

      // 4. Savings Goals
      const remoteGoals = await fetchSavingsGoalsFromFirestore(uid);
      if (remoteGoals && remoteGoals.length > 0) {
        setSavingsGoals(remoteGoals);
      }
    } catch (err) {
      console.warn('Firestore initial sync non-critical warning:', err);
    }
  }, [user, categoryBudgets, themePreference]);

  // Initialize Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser) => {
        setGoogleEmail(currentUser.email);
        setGoogleUid(currentUser.uid);
        setIsAuthenticated(true);
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));

        await loadUserFirestoreData(currentUser.uid, currentUser.email || undefined);
      },
      () => {
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: false,
        }));
      }
    );

    return () => unsubscribe();
  }, [loadUserFirestoreData]);

  // Helper to sync transactions to spreadsheet if connected
  const syncTransactionsIfConnected = useCallback(
    async (txList: Transaction[]) => {
      const token = await getAccessToken();
      if (!token) return;

      try {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
        const sheetId = await getOrCreateSpreadsheet(token);
        await syncAllTransactionsToSheet(token, sheetId, txList, user.email || 'dzikrialifian@gmail.com');

        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });

        setSyncStatus({
          isConnected: true,
          spreadsheetId: sheetId,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
          lastSyncedAt: nowStr,
          isSyncing: false,
          error: null,
        });
      } catch (err: any) {
        console.error('Auto sync error:', err);
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          error: err.message || 'Gagal menyinkronkan data ke Google Sheets.',
        }));
      }
    },
    [user.email]
  );

  // Email Login Handler
  const handleEmailLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const loggedUser = await emailSignIn(email, pass);
      const uid = loggedUser.uid;
      setGoogleUid(uid);
      setGoogleEmail(loggedUser.email);
      setUser((prev) => ({
        ...prev,
        email: loggedUser.email || email,
        name: loggedUser.displayName || prev.name,
      }));
      setIsAuthenticated(true);
      await loadUserFirestoreData(uid, loggedUser.email || email);
    } catch (err: any) {
      console.warn('Firebase email login error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError(
          'Penyedia Email/Password belum diaktifkan di Firebase Console. Kamu bisa masuk menggunakan tombol "Masuk dengan Google".'
        );
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Email atau kata sandi tidak sesuai. Silakan periksa kembali.');
      } else if (err.code === 'auth/user-not-found') {
        setAuthError('Akun belum terdaftar. Silakan pilih tab "Daftar Akun".');
      } else {
        setAuthError(err.message || 'Gagal masuk dengan email.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email Register Handler
  const handleEmailRegister = async (email: string, pass: string, displayName: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const newUser = await emailSignUp(email, pass, displayName);
      const uid = newUser.uid;
      setGoogleUid(uid);
      setGoogleEmail(newUser.email);
      const updatedProfile = {
        ...user,
        email: newUser.email || email,
        name: displayName,
        themePreference,
      };
      setUser(updatedProfile);
      setIsAuthenticated(true);

      // Create new clean profile in Firestore
      await saveUserProfileToFirestore(uid, updatedProfile);
      for (const t of transactions) {
        await saveTransactionToFirestore(uid, { ...t, userEmail: email });
      }
      await saveCategoryBudgetsToFirestore(uid, categoryBudgets);
    } catch (err: any) {
      console.warn('Firebase email register error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email ini sudah terdaftar. Silakan pilih tab "Masuk".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError(
          'Penyedia Email/Password belum diaktifkan di Firebase Console. Silakan gunakan opsi Google Sign-In.'
        );
      } else {
        setAuthError(err.message || 'Gagal mendaftarkan akun.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Connect Google account & run first sync for Firestore & Sheets
  const handleConnectGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
      const result = await googleSignIn();
      if (!result) return;

      setGoogleEmail(result.user.email);
      setGoogleUid(result.user.uid);
      setIsAuthenticated(true);

      const updatedProfile = {
        ...user,
        email: result.user.email || user.email,
        name: result.user.displayName || user.name,
        avatarUrl: result.user.photoURL || user.avatarUrl,
        themePreference,
      };
      setUser(updatedProfile);

      // Save user & transactions to Firestore
      await saveUserProfileToFirestore(result.user.uid, updatedProfile);
      for (const t of transactions) {
        await saveTransactionToFirestore(result.user.uid, {
          ...t,
          userEmail: result.user.email || undefined,
        });
      }
      await saveCategoryBudgetsToFirestore(result.user.uid, categoryBudgets);

      // Sync to Google Sheets
      const sheetId = await getOrCreateSpreadsheet(result.accessToken);
      await syncAllTransactionsToSheet(
        result.accessToken,
        sheetId,
        transactions,
        result.user.email || undefined
      );

      const nowStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setSyncStatus({
        isConnected: true,
        spreadsheetId: sheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
        lastSyncedAt: nowStr,
        isSyncing: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setAuthError(err.message || 'Gagal login dengan akun Google.');
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Gagal login dengan akun Google.',
      }));
    } finally {
      setAuthLoading(false);
    }
  };

  // Disconnect / Logout
  const handleLogout = async () => {
    await logout();
    setGoogleEmail(null);
    setGoogleUid(null);
    setIsAuthenticated(false);
    setSyncStatus((prev) => ({
      ...prev,
      isConnected: false,
      lastSyncedAt: null,
      error: null,
    }));
  };

  // Theme Setter with Firestore synchronization
  const handleSetTheme = async (nextTheme: ThemePreference) => {
    setThemePreference(nextTheme);
    setUser((prev) => ({ ...prev, themePreference: nextTheme }));
    try {
      localStorage.setItem('myrupiah_theme', nextTheme);
    } catch {}

    if (googleUid) {
      try {
        await saveUserProfileToFirestore(googleUid, {
          ...user,
          themePreference: nextTheme,
        });
      } catch (e) {
        console.warn('Firestore theme update warning:', e);
      }
    }
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemePreference = isDarkModeActive ? 'light' : 'dark';
    handleSetTheme(nextTheme);
  };

  // Manual Push Sync
  const handleManualSync = async () => {
    const token = await getAccessToken();
    if (!token) {
      handleConnectGoogle();
      return;
    }
    await syncTransactionsIfConnected(transactions);
    if (googleUid) {
      for (const t of transactions) {
        await saveTransactionToFirestore(googleUid, {
          ...t,
          userEmail: user.email || 'dzikrialifian@gmail.com',
        });
      }
    }
  };

  // Pull / Import from Google Sheets
  const handleImportFromSheets = async () => {
    const token = await getAccessToken();
    if (!token || !syncStatus.spreadsheetId) return;

    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
      const imported = await importTransactionsFromSheet(token, syncStatus.spreadsheetId);

      if (imported.length > 0) {
        setTransactions(imported);

        // Recalculate category budgets
        const categoryMap = imported
          .filter((t) => t.type === 'expense')
          .reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {});

        const updatedBudgets = categoryBudgets.map((cat) => ({
          ...cat,
          spent: categoryMap[cat.id] || 0,
        }));
        setCategoryBudgets(updatedBudgets);

        // Sync imported data to Firestore as well
        if (googleUid) {
          for (const t of imported) {
            await saveTransactionToFirestore(googleUid, {
              ...t,
              userEmail: user.email || undefined,
            });
          }
          await saveCategoryBudgetsToFirestore(googleUid, updatedBudgets);
        }
      }

      const nowStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: nowStr,
        error: null,
      }));
    } catch (err: any) {
      console.error('Import error:', err);
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Gagal mengimpor dari Google Sheets.',
      }));
    }
  };

  // CRUD: Create & Update Transactions
  const handleSaveTransaction = (trxData: Omit<Transaction, 'id'>, editId?: string) => {
    let updatedList: Transaction[] = [];

    if (editId) {
      // UPDATE operation
      const oldTrx = transactions.find((t) => t.id === editId);
      const updatedItem: Transaction = {
        ...trxData,
        id: editId,
        userEmail: user.email || 'dzikrialifian@gmail.com',
      };
      updatedList = transactions.map((t) => (t.id === editId ? updatedItem : t));
      setTransactions(updatedList);

      // Adjust category budgets
      if (oldTrx) {
        const nextBudgets = categoryBudgets.map((cat) => {
          let newSpent = cat.spent;
          if (oldTrx.type === 'expense' && cat.id === oldTrx.category) {
            newSpent -= oldTrx.amount;
          }
          if (trxData.type === 'expense' && cat.id === trxData.category) {
            newSpent += trxData.amount;
          }
          return { ...cat, spent: Math.max(0, newSpent) };
        });
        setCategoryBudgets(nextBudgets);

        if (googleUid) {
          saveCategoryBudgetsToFirestore(googleUid, nextBudgets).catch((e) => console.warn(e));
        }
      }

      // Sync updated item to Firestore
      if (googleUid) {
        saveTransactionToFirestore(googleUid, updatedItem).catch((e) => console.warn(e));
      }
    } else {
      // CREATE operation
      const newTrx: Transaction = {
        ...trxData,
        id: `trx-${Date.now()}`,
        userEmail: user.email || 'dzikrialifian@gmail.com',
      };
      updatedList = [newTrx, ...transactions];
      setTransactions(updatedList);

      if (newTrx.type === 'expense') {
        const nextBudgets = categoryBudgets.map((cat) =>
          cat.id === newTrx.category ? { ...cat, spent: cat.spent + newTrx.amount } : cat
        );
        setCategoryBudgets(nextBudgets);

        if (googleUid) {
          saveCategoryBudgetsToFirestore(googleUid, nextBudgets).catch((e) => console.warn(e));
        }
      }

      // Sync new item to Firestore
      if (googleUid) {
        saveTransactionToFirestore(googleUid, newTrx).catch((e) => console.warn(e));
      }
    }

    // Auto sync to Google Sheets if connected
    if (syncStatus.isConnected) {
      syncTransactionsIfConnected(updatedList);
    }
  };

  // CRUD: Delete Transactions
  const handleDeleteTransaction = (id: string) => {
    const trxToDelete = transactions.find((t) => t.id === id);
    if (!trxToDelete) return;

    const updatedList = transactions.filter((t) => t.id !== id);
    setTransactions(updatedList);

    if (trxToDelete.type === 'expense') {
      const nextBudgets = categoryBudgets.map((cat) =>
        cat.id === trxToDelete.category
          ? { ...cat, spent: Math.max(0, cat.spent - trxToDelete.amount) }
          : cat
      );
      setCategoryBudgets(nextBudgets);

      if (googleUid) {
        saveCategoryBudgetsToFirestore(googleUid, nextBudgets).catch((e) => console.warn(e));
      }
    }

    // Remove from Firestore
    if (googleUid) {
      deleteTransactionFromFirestore(googleUid, id).catch((e) => console.warn(e));
    }

    // Auto sync removal to Google Sheets
    if (syncStatus.isConnected) {
      syncTransactionsIfConnected(updatedList);
    }
  };

  // CRUD: Savings Goals
  const handleSaveSavingsGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    let updatedList: SavingsGoal[] = [];

    if (editId) {
      // UPDATE goal
      const existing = savingsGoals.find((g) => g.id === editId);
      const updatedItem: SavingsGoal = {
        ...goalData,
        id: editId,
        userId: googleUid || undefined,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = savingsGoals.map((g) => (g.id === editId ? updatedItem : g));
      setSavingsGoals(updatedList);

      if (googleUid) {
        saveSavingsGoalToFirestore(googleUid, updatedItem).catch((e) => console.warn(e));
      }
    } else {
      // CREATE goal
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        userId: googleUid || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newGoal, ...savingsGoals];
      setSavingsGoals(updatedList);

      if (googleUid) {
        saveSavingsGoalToFirestore(googleUid, newGoal).catch((e) => console.warn(e));
      }
    }
  };

  const handleDeleteSavingsGoal = (goalId: string) => {
    const nextList = savingsGoals.filter((g) => g.id !== goalId);
    setSavingsGoals(nextList);

    if (googleUid) {
      deleteSavingsGoalFromFirestore(googleUid, goalId).catch((e) => console.warn(e));
    }
  };

  const handleSavingsDeposit = (
    goalId: string,
    deltaAmount: number,
    isDeposit: boolean,
    alsoRecordTransaction: boolean
  ) => {
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newAmount = isDeposit
      ? targetGoal.currentAmount + deltaAmount
      : Math.max(0, targetGoal.currentAmount - deltaAmount);

    const updatedGoal: SavingsGoal = {
      ...targetGoal,
      currentAmount: newAmount,
      updatedAt: new Date().toISOString(),
    };

    const nextGoals = savingsGoals.map((g) => (g.id === goalId ? updatedGoal : g));
    setSavingsGoals(nextGoals);

    if (googleUid) {
      saveSavingsGoalToFirestore(googleUid, updatedGoal).catch((e) => console.warn(e));
    }

    // Also record transaction entry in mutasi if selected
    if (alsoRecordTransaction) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      handleSaveTransaction({
        title: isDeposit
          ? `Setor Tabungan: ${targetGoal.title}`
          : `Tarik Tabungan: ${targetGoal.title}`,
        amount: deltaAmount,
        type: isDeposit ? 'expense' : 'income',
        category: isDeposit ? 'other' : 'income',
        categoryName: isDeposit ? 'Tabungan & Impian' : 'Penarikan Tabungan',
        dateStr: `Hari ini, ${timeStr}`,
        dateIso: now.toISOString().slice(0, 10),
        paymentMethod: 'Mutasi Tabungan',
        note: `Transaksi tabungan target "${targetGoal.title}"`,
      });
    }
  };

  const handleQuickPresetCreate = (title: string, targetAmount: number, category: any) => {
    handleSaveSavingsGoal({
      title,
      targetAmount,
      currentAmount: 0,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category,
      categoryName: 'Tabungan Impian',
      icon: category === 'emergency' ? '🛡️' : category === 'gadget' ? '💻' : '✈️',
      color: '#006948',
      note: 'Dibuat dari inspirasi cepat',
    });
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    setUser({ ...INITIAL_USER, email: user.email || 'dzikrialifian@gmail.com', themePreference });
    setTransactions(INITIAL_TRANSACTIONS);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setDailySpends(INITIAL_DAILY_SPENDS);
    localStorage.removeItem('myrupiah_user');
    localStorage.removeItem('myrupiah_transactions');
    localStorage.removeItem('myrupiah_category_budgets');
    localStorage.removeItem('myrupiah_savings_goals');
    saveSpreadsheetId(null);
  };

  // Get active screen header title
  const activeTitle = useMemo(() => {
    switch (activeTab) {
      case 'beranda':
        return 'Beranda';
      case 'riwayat':
        return 'Riwayat';
      case 'tabungan':
        return 'Rencana Tabungan';
      case 'grafik':
        return 'Grafik';
      case 'saran':
        return 'Saran';
      case 'akun':
        return 'Akun & Profil';
      default:
        return 'Beranda';
    }
  }, [activeTab]);

  // Auth Gate: If user is not authenticated, show sleek AuthScreen first!
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onEmailLogin={handleEmailLogin}
        onEmailRegister={handleEmailRegister}
        onGoogleSignIn={handleConnectGoogle}
        isLoading={authLoading}
        errorMessage={authError}
        clearError={() => setAuthError(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf1ff]/60 dark:bg-[#06090e] flex justify-center selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      <div className="w-full max-w-md bg-[#f8f9ff] dark:bg-[#0b101b] min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden border-x border-slate-200/50 dark:border-slate-800/80 transition-colors">
        {/* Sticky Header with Quick Theme Toggle */}
        <Header
          user={user}
          activeScreenTitle={activeTitle}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setActiveTab('akun')}
          isDark={isDarkModeActive}
          onToggleTheme={handleToggleTheme}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 pb-16">
          {activeTab === 'beranda' && (
            <div className="animate-fade-in">
              {/* Greeting */}
              <GreetingSection
                user={user}
                onOpenWeekPicker={() => setIsWeekPickerOpen(true)}
              />

              {/* Weekly Budget Hero Card */}
              <WeeklyBudgetHeroCard
                totalBudget={user.totalWeeklyBudget}
                spent={weeklySpent}
                onCardClick={() => setActiveTab('saran')}
              />

              {/* Quick Stats: Hari Ini & Rata-rata */}
              <QuickStatsCards
                todaySpent={todaySpent}
                todayTransactionsCount={todayCount}
                dailyAllowance={dailyAllowance}
                daysRemaining={daysRemaining}
                belowAveragePercentage={56}
                onTodayClick={() => setActiveTab('riwayat')}
                onAverageClick={() => setActiveTab('saran')}
              />

              {/* Daily Spending Bar Chart */}
              <DailySpendingChart
                dailySpends={dailySpends}
                averageAmount={192000}
                onSelectDay={() => setActiveTab('riwayat')}
              />

              {/* Mini Savings Card on Dashboard */}
              <SavingsSummaryCard
                savingsGoals={savingsGoals}
                onOpenSavingsScreen={() => setActiveTab('tabungan')}
                onOpenCreateGoal={() => {
                  setEditingSavingsGoal(null);
                  setIsSavingsModalOpen(true);
                }}
              />

              {/* Tips Cerdas My Rupiah */}
              <TipsCard onOpenTipsModal={() => setIsTipsModalOpen(true)} />

              {/* Transaksi Terakhir */}
              <RecentTransactionsList
                transactions={transactions}
                onViewAll={() => setActiveTab('riwayat')}
                onSelectTransaction={(trx) => setSelectedTransaction(trx)}
              />
            </div>
          )}

          {activeTab === 'riwayat' && (
            <div className="animate-fade-in">
              <HistoryScreen
                transactions={transactions}
                onSelectTransaction={(trx) => setSelectedTransaction(trx)}
                onOpenAddModal={() => {
                  setEditingTransaction(null);
                  setIsFormModalOpen(true);
                }}
                onEditTransaction={(trx) => {
                  setEditingTransaction(trx);
                  setIsFormModalOpen(true);
                }}
                onRequestDeleteTransaction={(trx) => setDeletingTransaction(trx)}
                userEmail={user.email || googleEmail}
                syncStatus={syncStatus}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleLogout}
                onManualSync={handleManualSync}
                onImportFromSheets={handleImportFromSheets}
              />
            </div>
          )}

          {activeTab === 'tabungan' && (
            <div className="animate-fade-in">
              <SavingsScreen
                savingsGoals={savingsGoals}
                onOpenCreateModal={() => {
                  setEditingSavingsGoal(null);
                  setIsSavingsModalOpen(true);
                }}
                onEditGoal={(goal) => {
                  setEditingSavingsGoal(goal);
                  setIsSavingsModalOpen(true);
                }}
                onDeleteGoal={handleDeleteSavingsGoal}
                onOpenDepositModal={(goal) => setDepositGoal(goal)}
                onQuickPresetCreate={handleQuickPresetCreate}
              />
            </div>
          )}

          {activeTab === 'grafik' && (
            <div className="animate-fade-in">
              <AnalyticsScreen
                transactions={transactions}
                dailySpends={dailySpends}
                totalWeeklyBudget={user.totalWeeklyBudget}
              />
            </div>
          )}

          {activeTab === 'saran' && (
            <div className="animate-fade-in">
              <AdviceScreen
                categoryBudgets={categoryBudgets}
                onUpdateBudget={(id, newLimit) => {
                  const updated = categoryBudgets.map((c) =>
                    c.id === id ? { ...c, limit: newLimit } : c
                  );
                  setCategoryBudgets(updated);
                  if (googleUid) {
                    saveCategoryBudgetsToFirestore(googleUid, updated).catch((e) => console.warn(e));
                  }
                }}
                onOpenTipsModal={() => setIsTipsModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'akun' && (
            <div className="animate-fade-in">
              <AccountSettingsScreen
                user={user}
                onUpdateUser={async (updated) => {
                  const nextUser = { ...user, ...updated };
                  setUser(nextUser);
                  if (updated.themePreference) {
                    setThemePreference(updated.themePreference);
                  }
                  if (googleUid) {
                    try {
                      await saveUserProfileToFirestore(googleUid, nextUser);
                    } catch (e) {
                      console.warn('Firestore update warning:', e);
                    }
                  }
                }}
                onLogout={handleLogout}
                onResetData={handleResetDemoData}
                syncStatus={syncStatus}
                onConnectGoogle={handleConnectGoogle}
                onManualSync={handleManualSync}
                onThemeSelect={handleSetTheme}
              />
            </div>
          )}
        </main>

        {/* Fixed Bottom Navigation Dock & FAB */}
        <BottomNavBar
          currentTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsFormModalOpen(true);
          }}
        />

        {/* Modal: Tambah / Edit Transaksi */}
        <TransactionFormModal
          isOpen={isFormModalOpen}
          initialTransaction={editingTransaction}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSaveTransaction}
          isGoogleConnected={syncStatus.isConnected}
        />

        {/* Modal: Detail Transaksi */}
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onEdit={(trx) => {
            setEditingTransaction(trx);
            setIsFormModalOpen(true);
          }}
          onRequestDelete={(trx) => setDeletingTransaction(trx)}
        />

        {/* Modal: Konfirmasi Hapus Transaksi */}
        <DeleteConfirmationModal
          isOpen={Boolean(deletingTransaction)}
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirmDelete={handleDeleteTransaction}
          isGoogleConnected={syncStatus.isConnected}
        />

        {/* Modal: Tambah / Edit Rencana Tabungan */}
        <SavingsGoalModal
          isOpen={isSavingsModalOpen}
          initialGoal={editingSavingsGoal}
          onClose={() => {
            setIsSavingsModalOpen(false);
            setEditingSavingsGoal(null);
          }}
          onSubmit={handleSaveSavingsGoal}
        />

        {/* Modal: Setor / Tarik Tabungan */}
        <SavingsDepositModal
          isOpen={Boolean(depositGoal)}
          goal={depositGoal}
          onClose={() => setDepositGoal(null)}
          onConfirm={handleSavingsDeposit}
        />

        {/* Drawer: Notifikasi */}
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        {/* Modal: Wawasan Kopi Tips */}
        <TipsDetailModal
          isOpen={isTipsModalOpen}
          onClose={() => setIsTipsModalOpen(false)}
        />

        {/* Modal: Week Picker */}
        <WeekPickerModal
          isOpen={isWeekPickerOpen}
          onClose={() => setIsWeekPickerOpen(false)}
          currentWeekText={user.currentWeekText}
          onSelectWeek={(weekText) => {
            const nextUser = { ...user, currentWeekText: weekText };
            setUser(nextUser);
            if (googleUid) {
              saveUserProfileToFirestore(googleUid, nextUser).catch((e) => console.warn(e));
            }
          }}
        />
      </div>
    </div>
  );
}
