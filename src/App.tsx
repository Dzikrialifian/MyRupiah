import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_DAILY_SPENDS,
  INITIAL_CATEGORY_BUDGETS,
} from './data/mockData';
import {
  Transaction,
  UserProfile,
  CategoryBudget,
  DaySpend,
} from './types';
import { Header } from './components/Header';
import { GreetingSection } from './components/GreetingSection';
import { WeeklyBudgetHeroCard } from './components/WeeklyBudgetHeroCard';
import { QuickStatsCards } from './components/QuickStatsCards';
import { DailySpendingChart } from './components/DailySpendingChart';
import { TipsCard } from './components/TipsCard';
import { RecentTransactionsList } from './components/RecentTransactionsList';
import { BottomNavBar, ScreenTab } from './components/BottomNavBar';

// Screens
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { AdviceScreen } from './components/screens/AdviceScreen';

// Modals
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { DeleteConfirmationModal } from './components/modals/DeleteConfirmationModal';
import { BudgetSettingsModal } from './components/modals/BudgetSettingsModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { TipsDetailModal } from './components/modals/TipsDetailModal';
import { WeekPickerModal } from './components/modals/WeekPickerModal';

// Google Workspace & Sheets Services
import { initAuth, googleSignIn, getAccessToken, logout } from './services/auth';
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
} from './services/firebaseService';

export default function App() {
  // Persistence state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('myrupiah_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
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

  const [dailySpends, setDailySpends] = useState<DaySpend[]>(INITIAL_DAILY_SPENDS);
  const [activeTab, setActiveTab] = useState<ScreenTab>('beranda');

  // Google & Firebase integration state
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleUid, setGoogleUid] = useState<string | null>(null);
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('myrupiah_user', JSON.stringify(user));
    } catch {}
  }, [user]);

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

  // Derived budget calculations
  const weeklyExpenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  const weeklySpent = useMemo(() => {
    const initialSum = INITIAL_TRANSACTIONS.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const currentSum = weeklyExpenseTransactions.reduce((s, t) => s + t.amount, 0);

    if (transactions.length === INITIAL_TRANSACTIONS.length && currentSum === initialSum) {
      return 1350000;
    }
    return currentSum;
  }, [weeklyExpenseTransactions, transactions]);

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
          return { ...d, amount: todaySpent > 0 ? todaySpent : 85000 };
        }
        return d;
      })
    );
  }, [todaySpent]);

  // Initialize Auth listener and Firebase Firestore syncing on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, token) => {
        setGoogleEmail(currentUser.email);
        setGoogleUid(currentUser.uid);
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));

        // Load data from Firestore if exists, or seed initial data
        try {
          const remoteTxs = await fetchTransactionsFromFirestore(currentUser.uid);
          if (remoteTxs && remoteTxs.length > 0) {
            setTransactions(remoteTxs);
          } else {
            // Seed current transactions to Firestore
            for (const t of transactions) {
              await saveTransactionToFirestore(currentUser.uid, t);
            }
          }

          const remoteProfile = await fetchUserProfileFromFirestore(currentUser.uid);
          if (remoteProfile && remoteProfile.name) {
            setUser((prev) => ({ ...prev, ...remoteProfile }));
          } else {
            await saveUserProfileToFirestore(currentUser.uid, user);
          }

          const remoteBudgets = await fetchCategoryBudgetsFromFirestore(currentUser.uid);
          if (remoteBudgets && remoteBudgets.length > 0) {
            setCategoryBudgets(remoteBudgets);
          } else {
            await saveCategoryBudgetsToFirestore(currentUser.uid, categoryBudgets);
          }
        } catch (err) {
          console.warn('Firestore initial sync non-critical warning:', err);
        }
      },
      () => {
        setGoogleEmail(null);
        setGoogleUid(null);
        setSyncStatus((prev) => ({
          ...prev,
          isConnected: false,
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to sync transactions to spreadsheet if connected
  const syncTransactionsIfConnected = useCallback(
    async (txList: Transaction[]) => {
      const token = await getAccessToken();
      if (!token) return;

      try {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
        const sheetId = await getOrCreateSpreadsheet(token);
        await syncAllTransactionsToSheet(token, sheetId, txList);

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
    []
  );

  // Connect Google account & run first sync for Firestore & Sheets
  const handleConnectGoogle = async () => {
    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
      const result = await googleSignIn();
      if (!result) return;

      setGoogleEmail(result.user.email);
      setGoogleUid(result.user.uid);

      // Save user & transactions to Firestore
      await saveUserProfileToFirestore(result.user.uid, user);
      for (const t of transactions) {
        await saveTransactionToFirestore(result.user.uid, t);
      }
      await saveCategoryBudgetsToFirestore(result.user.uid, categoryBudgets);

      // Sync to Google Sheets
      const sheetId = await getOrCreateSpreadsheet(result.accessToken);
      await syncAllTransactionsToSheet(result.accessToken, sheetId, transactions);

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
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Gagal login dengan akun Google.',
      }));
    }
  };

  // Disconnect Google account
  const handleDisconnectGoogle = async () => {
    await logout();
    setGoogleEmail(null);
    setGoogleUid(null);
    setSyncStatus((prev) => ({
      ...prev,
      isConnected: false,
      lastSyncedAt: null,
      error: null,
    }));
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
        await saveTransactionToFirestore(googleUid, t);
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
            await saveTransactionToFirestore(googleUid, t);
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

  // CRUD: Create & Update
  const handleSaveTransaction = (trxData: Omit<Transaction, 'id'>, editId?: string) => {
    let updatedList: Transaction[] = [];

    if (editId) {
      // UPDATE operation
      const oldTrx = transactions.find((t) => t.id === editId);
      const updatedItem: Transaction = { ...trxData, id: editId };
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

  // CRUD: Delete
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

  // Reset to initial demo data
  const handleResetDemoData = () => {
    setUser(INITIAL_USER);
    setTransactions(INITIAL_TRANSACTIONS);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setDailySpends(INITIAL_DAILY_SPENDS);
    localStorage.removeItem('myrupiah_user');
    localStorage.removeItem('myrupiah_transactions');
    localStorage.removeItem('myrupiah_category_budgets');
    saveSpreadsheetId(null);
  };

  // Get active screen header title
  const activeTitle = useMemo(() => {
    switch (activeTab) {
      case 'beranda':
        return 'Beranda';
      case 'riwayat':
        return 'Riwayat';
      case 'grafik':
        return 'Grafik';
      case 'saran':
        return 'Saran';
      default:
        return 'Beranda';
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#eaf1ff]/60 flex justify-center selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md bg-[#f8f9ff] min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden border-x border-slate-200/50">
        {/* Sticky Header */}
        <Header
          user={user}
          activeScreenTitle={activeTitle}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
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
                todaySpent={todaySpent > 0 ? todaySpent : 85000}
                todayTransactionsCount={todayCount > 0 ? todayCount : 3}
                dailyAllowance={dailyAllowance > 0 ? dailyAllowance : 192850}
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
                userEmail={googleEmail}
                syncStatus={syncStatus}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleDisconnectGoogle}
                onManualSync={handleManualSync}
                onImportFromSheets={handleImportFromSheets}
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

        {/* Modal: Konfirmasi Hapus Transaksi (Destructive confirmation) */}
        <DeleteConfirmationModal
          isOpen={Boolean(deletingTransaction)}
          transaction={deletingTransaction}
          onClose={() => setDeletingTransaction(null)}
          onConfirmDelete={handleDeleteTransaction}
          isGoogleConnected={syncStatus.isConnected}
        />

        {/* Modal: Pengaturan Profil & Anggaran */}
        <BudgetSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onUpdateUser={(updated) => {
            const nextUser = { ...user, ...updated };
            setUser(nextUser);
            if (googleUid) {
              saveUserProfileToFirestore(googleUid, nextUser).catch((e) => console.warn(e));
            }
          }}
          onResetData={handleResetDemoData}
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
