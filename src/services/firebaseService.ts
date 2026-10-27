import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './auth';
import { Transaction, UserProfile, CategoryBudget, SavingsGoal } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Firestore operations
export async function saveUserProfileToFirestore(userId: string, user: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        uid: userId,
        name: user.name,
        email: user.email || '',
        totalWeeklyBudget: user.totalWeeklyBudget,
        currentWeekText: user.currentWeekText,
        avatarUrl: user.avatarUrl,
        themePreference: user.themePreference || 'system',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      name: data.name,
      email: data.email,
      totalWeeklyBudget: data.totalWeeklyBudget,
      currentWeekText: data.currentWeekText,
      avatarUrl: data.avatarUrl,
      themePreference: data.themePreference || 'system',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Transactions Firestore operations
export async function saveTransactionToFirestore(userId: string, transaction: Transaction): Promise<void> {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(
      txRef,
      {
        id: transaction.id,
        userId,
        userEmail: transaction.userEmail || '',
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        categoryName: transaction.categoryName,
        dateStr: transaction.dateStr,
        dateIso: transaction.dateIso,
        paymentMethod: transaction.paymentMethod,
        note: transaction.note || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTransactionFromFirestore(userId: string, transactionId: string): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(txRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchTransactionsFromFirestore(userId: string): Promise<Transaction[]> {
  const path = `users/${userId}/transactions`;
  try {
    const txCollection = collection(db, 'users', userId, 'transactions');
    const snap = await getDocs(txCollection);
    const items: Transaction[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: data.id || docSnap.id,
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: data.category,
        categoryName: data.categoryName,
        dateStr: data.dateStr,
        dateIso: data.dateIso || '',
        paymentMethod: data.paymentMethod,
        note: data.note || undefined,
        userEmail: data.userEmail || undefined,
      });
    });

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Category Budgets Firestore operations
export async function saveCategoryBudgetsToFirestore(
  userId: string,
  budgets: CategoryBudget[]
): Promise<void> {
  for (const b of budgets) {
    const path = `users/${userId}/categoryBudgets/${b.id}`;
    try {
      const budgetRef = doc(db, 'users', userId, 'categoryBudgets', b.id);
      await setDoc(
        budgetRef,
        {
          id: b.id,
          userId,
          name: b.name,
          spent: b.spent,
          limit: b.limit,
          icon: b.icon,
          color: b.color,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function fetchCategoryBudgetsFromFirestore(userId: string): Promise<CategoryBudget[]> {
  const path = `users/${userId}/categoryBudgets`;
  try {
    const budgetCollection = collection(db, 'users', userId, 'categoryBudgets');
    const snap = await getDocs(budgetCollection);
    const items: CategoryBudget[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: data.id as any,
        name: data.name,
        spent: data.spent || 0,
        limit: data.limit,
        icon: data.icon || '🏷️',
        color: data.color || '#006948',
      });
    });

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Savings Goals Firestore operations
export async function saveSavingsGoalToFirestore(
  userId: string,
  goal: SavingsGoal
): Promise<void> {
  const path = `users/${userId}/savingsGoals/${goal.id}`;
  try {
    const goalRef = doc(db, 'users', userId, 'savingsGoals', goal.id);
    await setDoc(
      goalRef,
      {
        id: goal.id,
        userId,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        category: goal.category,
        categoryName: goal.categoryName || '',
        icon: goal.icon || 'PiggyBank',
        color: goal.color || '#006948',
        note: goal.note || '',
        createdAt: goal.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSavingsGoalFromFirestore(
  userId: string,
  goalId: string
): Promise<void> {
  const path = `users/${userId}/savingsGoals/${goalId}`;
  try {
    const goalRef = doc(db, 'users', userId, 'savingsGoals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchSavingsGoalsFromFirestore(
  userId: string
): Promise<SavingsGoal[]> {
  const path = `users/${userId}/savingsGoals`;
  try {
    const goalsCollection = collection(db, 'users', userId, 'savingsGoals');
    const snap = await getDocs(goalsCollection);
    const items: SavingsGoal[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: data.id || docSnap.id,
        userId: data.userId || userId,
        title: data.title,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        targetDate: data.targetDate || '',
        category: data.category || 'other',
        categoryName: data.categoryName,
        icon: data.icon || 'PiggyBank',
        color: data.color || '#006948',
        note: data.note || undefined,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    });

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
