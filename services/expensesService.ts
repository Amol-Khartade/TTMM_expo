import firestore from '@react-native-firebase/firestore';
import { Expense, Balance, Settlement, Group } from '@/types';
import { notificationService } from './notificationService';

class ExpensesService {
  async addExpense(expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const expense: Omit<Expense, 'id'> = {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await firestore().collection('expenses').add(expense);

      const groupDoc = await firestore().collection('groups').doc(expenseData.groupId).get();
      const groupData = groupDoc.data() as Group;

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
      const snapshot = await firestore()
        .collection('expenses')
        .where('groupId', '==', groupId)
        .orderBy('date', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await firestore()
        .collection('expenses')
        .doc(expenseId)
        .update(updateData);

      const updatedDoc = await firestore()
        .collection('expenses')
        .doc(expenseId)
        .get();

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
      await firestore().collection('expenses').doc(expenseId).delete();
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
        balances.set(expense.paidBy, balances.get(expense.paidBy)! + expense.amount);

        expense.splitDetails.forEach(split => {
          if (!balances.has(split.userId)) {
            balances.set(split.userId, 0);
          }
          balances.set(split.userId, balances.get(split.userId)! - split.amount);
        });
      });

      return Array.from(balances.entries()).map(([userId, amount]) => ({
        userId,
        groupId,
        amount,
        currency: 'INR',
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async createSettlement(settlementData: Omit<Settlement, 'id' | 'createdAt' | 'settledAt'>): Promise<Settlement> {
    try {
      const settlement: Omit<Settlement, 'id'> = {
        ...settlementData,
        createdAt: new Date(),
      };

      const docRef = await firestore().collection('settlements').add(settlement);

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
      const updateData = {
        status: 'completed' as const,
        settledAt: new Date(),
      };

      await firestore()
        .collection('settlements')
        .doc(settlementId)
        .update(updateData);

      const updatedDoc = await firestore()
        .collection('settlements')
        .doc(settlementId)
        .get();

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