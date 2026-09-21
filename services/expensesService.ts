import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import { Expense, Balance, Settlement, Group } from '@/types';
import { notificationService } from './notificationService';
import { sanitizeForFirestore } from '@/utils/firestoreUtils';
import { sortByDateDesc } from '@/utils/formatters';

class ExpensesService {
  async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const db = getFirestore();
      const expense: Omit<Expense, 'id'> = {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cleanExpense = sanitizeForFirestore(expense);
      const expensesCol = collection(db, 'expenses');
      const docRef = await addDoc(expensesCol, cleanExpense);

      const groupDocRef = doc(db, 'groups', expenseData.groupId);
      const groupDoc = await getDoc(groupDocRef);
      const groupData = groupDoc.exists() ? (groupDoc.data() as Group) : null;

      if (groupData?.members) {
        for (const member of groupData.members) {
          if (member.userId !== expenseData.createdBy) {
            await notificationService.sendNotification(member.userId, {
              type: 'expense_added',
              title: 'New Expense Added',
              message: `${expenseData.title} - ₹${expenseData.amount}`,
              data: { groupId: expenseData.groupId, expenseId: docRef.id },
            });
          }
        }
      }

      return {
        id: docRef.id,
        ...expense,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    try {
      const db = getFirestore();
      const expensesCol = collection(db, 'expenses');
      const q = query(expensesCol, where('groupId', '==', groupId));
      const snapshot = await getDocs(q);

      const expenses = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      })) as Expense[];

      return sortByDateDesc(expenses, (e) => e.date);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const db = getFirestore();
      const expenseDocRef = doc(db, 'expenses', expenseId);
      const updateData = sanitizeForFirestore({
        ...updates,
        updatedAt: new Date(),
      });

      await updateDoc(expenseDocRef, updateData);

      const updatedDoc = await getDoc(expenseDocRef);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Expense;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const db = getFirestore();
      const expenseDocRef = doc(db, 'expenses', expenseId);
      await deleteDoc(expenseDocRef);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getGroupBalances(groupId: string): Promise<Balance[]> {
    try {
      const expenses = await this.getGroupExpenses(groupId);
      const balances: Map<string, number> = new Map();

      expenses.forEach(expense => {
        const totalSplitAmount = expense.splitDetails.reduce((sum, split) => sum + split.amount, 0);

        if (!balances.has(expense.paidBy)) {
          balances.set(expense.paidBy, 0);
        }
        balances.set(expense.paidBy, balances.get(expense.paidBy)! + totalSplitAmount);

        expense.splitDetails.forEach(split => {
          if (!balances.has(split.userId)) {
            balances.set(split.userId, 0);
          }
          balances.set(split.userId, balances.get(split.userId)! - split.amount);
        });
      });

      const settlements = await this.getGroupSettlements(groupId);
      settlements.forEach(settlement => {
        if (settlement.status === 'completed') {
          if (!balances.has(settlement.fromUserId)) {
            balances.set(settlement.fromUserId, 0);
          }
          balances.set(settlement.fromUserId, balances.get(settlement.fromUserId)! + settlement.amount);

          if (!balances.has(settlement.toUserId)) {
            balances.set(settlement.toUserId, 0);
          }
          balances.set(settlement.toUserId, balances.get(settlement.toUserId)! - settlement.amount);
        }
      });

      return Array.from(balances.entries()).map(([userId, amount]) => ({
        userId,
        groupId,
        amount: Math.round(amount * 100) / 100,
        currency: 'INR',
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getGroupSettlements(groupId: string): Promise<Settlement[]> {
    try {
      const db = getFirestore();
      const settlementsCol = collection(db, 'settlements');
      const q = query(settlementsCol, where('groupId', '==', groupId));
      const snapshot = await getDocs(q);

      const settlements = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      })) as Settlement[];

      return sortByDateDesc(settlements, (s) => s.createdAt);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async createSettlement(settlementData: Omit<Settlement, 'id' | 'createdAt' | 'settledAt'>): Promise<Settlement> {
    try {
      const db = getFirestore();
      const settlement: Omit<Settlement, 'id'> = {
        ...settlementData,
        createdAt: new Date(),
      };

      const cleanSettlement = sanitizeForFirestore(settlement);
      const settlementsCol = collection(db, 'settlements');
      const docRef = await addDoc(settlementsCol, cleanSettlement);

      await notificationService.sendNotification(settlementData.toUserId, {
        type: 'settlement_request',
        title: 'Settlement Request',
        message: `Settlement request for ₹${settlementData.amount}`,
        data: { settlementId: docRef.id, groupId: settlementData.groupId },
      });

      return {
        id: docRef.id,
        ...settlement,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async completeSettlement(settlementId: string): Promise<Settlement> {
    try {
      const db = getFirestore();
      const settlementDocRef = doc(db, 'settlements', settlementId);
      const updateData = {
        status: 'completed' as const,
        settledAt: new Date(),
      };

      await updateDoc(settlementDocRef, updateData);

      const updatedDoc = await getDoc(settlementDocRef);

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as Settlement;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  calculateSplits(amount: number, splitType: 'equal' | 'percentage' | 'exact', memberIds: string[], customSplits?: number[]): Array<{ userId: string; amount: number; percentage?: number }> {
    switch (splitType) {
      case 'equal':
        const equalAmount = Math.round((amount / memberIds.length) * 100) / 100;
        return memberIds.map(userId => ({ userId, amount: equalAmount }));

      case 'percentage':
        if (!customSplits || customSplits.length !== memberIds.length) {
          throw new Error('Invalid percentage splits');
        }
        const totalPercentage = customSplits.reduce((sum, p) => sum + p, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error('Percentages must sum to 100');
        }
        return memberIds.map((userId, index) => ({
          userId,
          amount: Math.round((amount * customSplits[index] / 100) * 100) / 100,
          percentage: customSplits[index],
        }));

      case 'exact':
        if (!customSplits || customSplits.length !== memberIds.length) {
          throw new Error('Invalid exact splits');
        }
        const totalAmount = customSplits.reduce((sum, a) => sum + a, 0);
        if (Math.abs(totalAmount - amount) > 0.01) {
          throw new Error('Split amounts must sum to total amount');
        }
        return memberIds.map((userId, index) => ({
          userId,
          amount: customSplits[index],
        }));

      default:
        throw new Error('Invalid split type');
    }
  }
}

export const expensesService = new ExpensesService();