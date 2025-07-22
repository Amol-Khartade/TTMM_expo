import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Expense, ExpenseSplit, Balance } from '@/types';
import { retry } from '@/utils/retry';
import { handleFirestoreError } from '@/utils/firestore';

export interface CreateExpenseData {
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'exact';
  splitDetails: ExpenseSplit[];
  category: string;
  date: Date;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  id: string;
}

class ExpenseService {
  private readonly COLLECTION_NAME = 'expenses';
  private readonly BALANCES_COLLECTION = 'balances';

  /**
   * Validates if the current user is authorized to perform operations
   */
  private validateCurrentUser(): string {
    const currentUser = auth().currentUser;
    if (!currentUser || !currentUser.uid) {
      throw new Error('User not authenticated');
    }
    return currentUser.uid;
  }

  /**
   * Validates expense data before saving
   */
  private validateExpenseData(data: CreateExpenseData | UpdateExpenseData): void {
    if (!data.title?.trim()) {
      throw new Error('Expense title is required');
    }
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!data.groupId) {
      throw new Error('Group ID is required');
    }
    if (!data.splitDetails || data.splitDetails.length === 0) {
      throw new Error('Split details are required');
    }

    // Validate split amounts
    const totalSplit = data.splitDetails.reduce((sum, split) => sum + split.amount, 0);
    const difference = Math.abs(totalSplit - data.amount);
    if (difference > 0.01) { // Allow for small floating point differences
      throw new Error('Split amounts must equal the total expense amount');
    }
  }

  /**
   * Creates a new expense with optimistic updates
   */
  async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    try {
      const userId = this.validateCurrentUser();
      this.validateExpenseData(expenseData);

      const expense: Omit<Expense, 'id'> = {
        ...expenseData,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create expense document
      const docRef = await retry(() =>
        firestore().collection(this.COLLECTION_NAME).add({
          ...expense,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      );

      const createdExpense: Expense = {
        ...expense,
        id: docRef.id,
      };

      // Update balances asynchronously for better performance
      this.updateBalancesAsync(expenseData.groupId, expenseData.splitDetails, expenseData.paidBy, expenseData.amount);

      return createdExpense;
    } catch (error) {
      return handleFirestoreError(error);
    }
  }

  /**
   * Updates an existing expense
   */
  async updateExpense(updateData: UpdateExpenseData): Promise<Expense> {
    try {
      const userId = this.validateCurrentUser();
      this.validateExpenseData(updateData);

      const { id, ...dataToUpdate } = updateData;

      // Get the original expense for balance calculations
      const originalExpense = await this.getExpenseById(id);
      if (!originalExpense) {
        throw new Error('Expense not found');
      }

      // Check permissions
      if (originalExpense.createdBy !== userId) {
        throw new Error('You can only update expenses you created');
      }

      // Update the expense
      await retry(() =>
        firestore().collection(this.COLLECTION_NAME).doc(id).update({
          ...dataToUpdate,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      );

      const updatedExpense: Expense = {
        ...originalExpense,
        ...dataToUpdate,
        id,
        updatedAt: new Date(),
      };

      // Recalculate balances if split details changed
      if (updateData.splitDetails || updateData.amount || updateData.paidBy) {
        this.recalculateBalancesAsync(originalExpense, updatedExpense);
      }

      return updatedExpense;
    } catch (error) {
      return handleFirestoreError(error);
    }
  }

  /**
   * Deletes an expense and updates balances
   */
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const userId = this.validateCurrentUser();

      // Get the expense to check permissions and for balance calculations
      const expense = await this.getExpenseById(expenseId);
      if (!expense) {
        throw new Error('Expense not found');
      }

      if (expense.createdBy !== userId) {
        throw new Error('You can only delete expenses you created');
      }

      // Delete the expense
      await retry(() =>
        firestore().collection(this.COLLECTION_NAME).doc(expenseId).delete()
      );

      // Reverse the balance changes
      this.reverseBalanceChangesAsync(expense);

      return true;
    } catch (error) {
      handleFirestoreError(error);
      return false;
    }
  }

  /**
   * Gets a single expense by ID
   */
  async getExpenseById(expenseId: string): Promise<Expense | null> {
    try {
      const doc = await retry(() =>
        firestore().collection(this.COLLECTION_NAME).doc(expenseId).get()
      );

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
        date: data?.date?.toDate() || new Date(),
      } as Expense;
    } catch (error) {
      console.error('Error getting expense:', error);
      return null;
    }
  }

  /**
   * Gets expenses for a group with pagination and caching
   */
  async getGroupExpenses(
    groupId: string,
    limit: number = 20,
    lastExpense?: Expense
  ): Promise<Expense[]> {
    try {
      this.validateCurrentUser();

      let query = firestore()
        .collection(this.COLLECTION_NAME)
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (lastExpense) {
        query = query.startAfter(lastExpense.createdAt);
      }

      const snapshot = await retry(() => query.get());

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          date: data.date?.toDate() || new Date(),
        } as Expense;
      });
    } catch (error) {
      console.error('Error getting group expenses:', error);
      return [];
    }
  }

  /**
   * Gets user expenses with filtering and sorting
   */
  async getUserExpenses(
    userId: string,
    filters?: {
      groupId?: string;
      category?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<Expense[]> {
    try {
      this.validateCurrentUser();

      let query = firestore()
        .collection(this.COLLECTION_NAME)
        .where('createdBy', '==', userId);

      if (filters?.groupId) {
        query = query.where('groupId', '==', filters.groupId);
      }

      if (filters?.category) {
        query = query.where('category', '==', filters.category);
      }

      query = query.orderBy('createdAt', 'desc');

      const snapshot = await retry(() => query.get());
      let expenses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          date: data.date?.toDate() || new Date(),
        } as Expense;
      });

      // Apply date filters in memory for better performance
      if (filters?.dateFrom || filters?.dateTo) {
        expenses = expenses.filter(expense => {
          if (filters.dateFrom && expense.date < filters.dateFrom) return false;
          if (filters.dateTo && expense.date > filters.dateTo) return false;
          return true;
        });
      }

      return expenses;
    } catch (error) {
      console.error('Error getting user expenses:', error);
      return [];
    }
  }

  /**
   * Gets balances for a group
   */
  async getGroupBalances(groupId: string): Promise<Balance[]> {
    try {
      this.validateCurrentUser();

      const snapshot = await retry(() =>
        firestore()
          .collection(this.BALANCES_COLLECTION)
          .where('groupId', '==', groupId)
          .get()
      );

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Balance[];
    } catch (error) {
      console.error('Error getting group balances:', error);
      return [];
    }
  }

  /**
   * Calculates split amounts based on split type
   */
  calculateSplitAmounts(
    amount: number,
    splitType: 'equal' | 'percentage' | 'exact',
    participants: string[],
    customSplits?: { userId: string; value: number }[]
  ): ExpenseSplit[] {
    switch (splitType) {
      case 'equal':
        const equalAmount = amount / participants.length;
        return participants.map(userId => ({
          userId,
          amount: Math.round(equalAmount * 100) / 100, // Round to 2 decimal places
        }));

      case 'percentage':
        if (!customSplits) throw new Error('Custom splits required for percentage split');
        const totalPercentage = customSplits.reduce((sum, split) => sum + split.value, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new Error('Percentages must add up to 100%');
        }
        return customSplits.map(split => ({
          userId: split.userId,
          amount: Math.round((amount * split.value / 100) * 100) / 100,
          percentage: split.value,
        }));

      case 'exact':
        if (!customSplits) throw new Error('Custom splits required for exact split');
        const totalExact = customSplits.reduce((sum, split) => sum + split.value, 0);
        if (Math.abs(totalExact - amount) > 0.01) {
          throw new Error('Exact amounts must add up to total expense amount');
        }
        return customSplits.map(split => ({
          userId: split.userId,
          amount: split.value,
        }));

      default:
        throw new Error('Invalid split type');
    }
  }

  /**
   * Updates balances asynchronously for better performance
   */
  private async updateBalancesAsync(
    groupId: string,
    splitDetails: ExpenseSplit[],
    paidBy: string,
    amount: number
  ): Promise<void> {
    try {
      const batch = firestore().batch();

      // Update balance for the person who paid
      const payerBalanceRef = firestore()
        .collection(this.BALANCES_COLLECTION)
        .doc(`${groupId}_${paidBy}`);

      batch.set(payerBalanceRef, {
        userId: paidBy,
        groupId,
        amount: firestore.FieldValue.increment(amount),
        currency: 'USD', // Should be parameterized
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Update balances for people who owe money
      for (const split of splitDetails) {
        if (split.userId !== paidBy) {
          const owesBalanceRef = firestore()
            .collection(this.BALANCES_COLLECTION)
            .doc(`${groupId}_${split.userId}`);

          batch.set(owesBalanceRef, {
            userId: split.userId,
            groupId,
            amount: firestore.FieldValue.increment(-split.amount),
            currency: 'USD',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  }

  /**
   * Recalculates balances when an expense is updated
   */
  private async recalculateBalancesAsync(
    originalExpense: Expense,
    updatedExpense: Expense
  ): Promise<void> {
    try {
      // Reverse the original balance changes
      await this.reverseBalanceChangesAsync(originalExpense);
      
      // Apply the new balance changes
      await this.updateBalancesAsync(
        updatedExpense.groupId,
        updatedExpense.splitDetails,
        updatedExpense.paidBy,
        updatedExpense.amount
      );
    } catch (error) {
      console.error('Error recalculating balances:', error);
    }
  }

  /**
   * Reverses balance changes when an expense is deleted
   */
  private async reverseBalanceChangesAsync(expense: Expense): Promise<void> {
    try {
      const batch = firestore().batch();

      // Reverse balance for the person who paid
      const payerBalanceRef = firestore()
        .collection(this.BALANCES_COLLECTION)
        .doc(`${expense.groupId}_${expense.paidBy}`);

      batch.set(payerBalanceRef, {
        userId: expense.paidBy,
        groupId: expense.groupId,
        amount: firestore.FieldValue.increment(-expense.amount),
        currency: expense.currency,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Reverse balances for people who owed money
      for (const split of expense.splitDetails) {
        if (split.userId !== expense.paidBy) {
          const owesBalanceRef = firestore()
            .collection(this.BALANCES_COLLECTION)
            .doc(`${expense.groupId}_${split.userId}`);

          batch.set(owesBalanceRef, {
            userId: split.userId,
            groupId: expense.groupId,
            amount: firestore.FieldValue.increment(split.amount),
            currency: expense.currency,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error reversing balance changes:', error);
    }
  }

  /**
   * Real-time listener for group expenses
   */
  subscribeToGroupExpenses(
    groupId: string,
    callback: (expenses: Expense[]) => void,
    limit: number = 50
  ): () => void {
    try {
      this.validateCurrentUser();

      const unsubscribe = firestore()
        .collection(this.COLLECTION_NAME)
        .where('groupId', '==', groupId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .onSnapshot(
          snapshot => {
            const expenses = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                date: data.date?.toDate() || new Date(),
              } as Expense;
            });
            callback(expenses);
          },
          error => {
            console.error('Error in expenses subscription:', error);
            callback([]);
          }
        );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up expenses subscription:', error);
      return () => {};
    }
  }
}

export const expenseService = new ExpenseService();