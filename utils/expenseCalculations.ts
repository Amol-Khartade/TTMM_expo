import { Expense, ExpenseSplit, Balance } from '@/types';

export interface CalculationResult {
  totalExpenses: number;
  totalPaid: number;
  totalOwed: number;
  balance: number;
  expenseCount: number;
}

export interface SettlementSuggestion {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export interface ExpenseAnalytics {
  totalAmount: number;
  averageExpense: number;
  categoryBreakdown: Record<string, number>;
  monthlyBreakdown: Record<string, number>;
  userContributions: Record<string, { paid: number; owed: number; balance: number }>;
}

export class ExpenseCalculations {
  /**
   * Calculate user's total expenses, paid amounts, and balance
   */
  static calculateUserSummary(expenses: Expense[], userId: string): CalculationResult {
    let totalExpenses = 0;
    let totalPaid = 0;
    let totalOwed = 0;

    for (const expense of expenses) {
      // Check if user paid for this expense
      if (expense.paidBy === userId) {
        totalPaid += expense.amount;
      }

      // Check how much user owes for this expense
      const userSplit = expense.splitDetails.find(split => split.userId === userId);
      if (userSplit) {
        totalOwed += userSplit.amount;
      }
    }

    totalExpenses = totalPaid; // Total expenses is what the user paid
    const balance = totalPaid - totalOwed; // Positive means others owe you, negative means you owe others

    return {
      totalExpenses,
      totalPaid,
      totalOwed,
      balance,
      expenseCount: expenses.length,
    };
  }

  /**
   * Calculate balances between all group members
   */
  static calculateGroupBalances(expenses: Expense[]): Record<string, number> {
    const balances: Record<string, number> = {};

    for (const expense of expenses) {
      // Add amount to payer's balance
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

      // Subtract split amounts from each participant
      for (const split of expense.splitDetails) {
        balances[split.userId] = (balances[split.userId] || 0) - split.amount;
      }
    }

    return balances;
  }

  /**
   * Generate optimal settlement suggestions using a simplified algorithm
   */
  static calculateSettlements(balances: Record<string, number>, currency = 'USD'): SettlementSuggestion[] {
    const settlements: SettlementSuggestion[] = [];
    
    // Separate debtors and creditors
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    for (const [userId, balance] of Object.entries(balances)) {
      if (balance < -0.01) { // Owes money (with small tolerance for floating point)
        debtors.push({ userId, amount: Math.abs(balance) });
      } else if (balance > 0.01) { // Is owed money
        creditors.push({ userId, amount: balance });
      }
    }

    // Sort debtors by amount descending, creditors by amount ascending
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => a.amount - b.amount);

    // Generate settlements using greedy approach
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) { // Only create settlement if amount is significant
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: Math.round(settlementAmount * 100) / 100,
          currency,
        });

        // Update remaining amounts
        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;
      }

      // Move to next debtor or creditor if current one is settled
      if (debtor.amount < 0.01) debtorIndex++;
      if (creditor.amount < 0.01) creditorIndex++;
    }

    return settlements;
  }

  /**
   * Generate comprehensive expense analytics
   */
  static generateExpenseAnalytics(expenses: Expense[]): ExpenseAnalytics {
    if (expenses.length === 0) {
      return {
        totalAmount: 0,
        averageExpense: 0,
        categoryBreakdown: {},
        monthlyBreakdown: {},
        userContributions: {},
      };
    }

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = totalAmount / expenses.length;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const expense of expenses) {
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
    }

    // Monthly breakdown
    const monthlyBreakdown: Record<string, number> = {};
    for (const expense of expenses) {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + expense.amount;
    }

    // User contributions
    const userContributions: Record<string, { paid: number; owed: number; balance: number }> = {};
    
    // Get all unique user IDs
    const allUserIds = new Set<string>();
    for (const expense of expenses) {
      allUserIds.add(expense.paidBy);
      for (const split of expense.splitDetails) {
        allUserIds.add(split.userId);
      }
    }

    // Calculate contributions for each user
    for (const userId of allUserIds) {
      let paid = 0;
      let owed = 0;

      for (const expense of expenses) {
        if (expense.paidBy === userId) {
          paid += expense.amount;
        }
        
        const userSplit = expense.splitDetails.find(split => split.userId === userId);
        if (userSplit) {
          owed += userSplit.amount;
        }
      }

      userContributions[userId] = {
        paid,
        owed,
        balance: paid - owed,
      };
    }

    return {
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageExpense: Math.round(averageExpense * 100) / 100,
      categoryBreakdown,
      monthlyBreakdown,
      userContributions,
    };
  }

  /**
   * Calculate expense split preview before saving
   */
  static calculateSplitPreview(
    amount: number,
    splitType: 'equal' | 'percentage' | 'exact',
    participants: Array<{ userId: string; displayName: string }>,
    customValues?: Record<string, number>
  ): ExpenseSplit[] & { isValid: boolean; error?: string } {
    try {
      const splits: ExpenseSplit[] = [];

      switch (splitType) {
        case 'equal':
          const equalAmount = amount / participants.length;
          for (const participant of participants) {
            splits.push({
              userId: participant.userId,
              amount: Math.round(equalAmount * 100) / 100,
            });
          }
          break;

        case 'percentage':
          if (!customValues) {
            return { ...splits, isValid: false, error: 'Percentage values required' };
          }

          let totalPercentage = 0;
          for (const participant of participants) {
            const percentage = customValues[participant.userId] || 0;
            totalPercentage += percentage;
            splits.push({
              userId: participant.userId,
              amount: Math.round((amount * percentage / 100) * 100) / 100,
              percentage,
            });
          }

          if (Math.abs(totalPercentage - 100) > 0.01) {
            return { ...splits, isValid: false, error: 'Percentages must total 100%' };
          }
          break;

        case 'exact':
          if (!customValues) {
            return { ...splits, isValid: false, error: 'Exact amounts required' };
          }

          let totalExact = 0;
          for (const participant of participants) {
            const exactAmount = customValues[participant.userId] || 0;
            totalExact += exactAmount;
            splits.push({
              userId: participant.userId,
              amount: exactAmount,
            });
          }

          if (Math.abs(totalExact - amount) > 0.01) {
            return { ...splits, isValid: false, error: 'Split amounts must equal total expense' };
          }
          break;

        default:
          return { ...splits, isValid: false, error: 'Invalid split type' };
      }

      return { ...splits, isValid: true };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : 'Calculation error' };
    }
  }

  /**
   * Filter and sort expenses with various criteria
   */
  static filterAndSortExpenses(
    expenses: Expense[],
    filters: {
      category?: string;
      paidBy?: string;
      dateFrom?: Date;
      dateTo?: Date;
      minAmount?: number;
      maxAmount?: number;
      searchTerm?: string;
    },
    sortBy: 'date' | 'amount' | 'title' | 'category' = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Expense[] {
    let filteredExpenses = [...expenses];

    // Apply filters
    if (filters.category) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.paidBy) {
      filteredExpenses = filteredExpenses.filter(expense => expense.paidBy === filters.paidBy);
    }

    if (filters.dateFrom) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date <= filters.dateTo!);
    }

    if (filters.minAmount !== undefined) {
      filteredExpenses = filteredExpenses.filter(expense => expense.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      filteredExpenses = filteredExpenses.filter(expense => expense.amount <= filters.maxAmount!);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredExpenses = filteredExpenses.filter(expense =>
        expense.title.toLowerCase().includes(searchLower) ||
        (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredExpenses.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredExpenses;
  }

  /**
   * Get expense statistics for a specific time period
   */
  static getExpenseStatistics(
    expenses: Expense[],
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): {
    current: ExpenseAnalytics;
    previous: ExpenseAnalytics;
    growth: number;
  } {
    const now = new Date();
    let currentPeriodStart: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    switch (period) {
      case 'week':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'month':
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentPeriodStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        previousPeriodStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'year':
        currentPeriodStart = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
        previousPeriodEnd = currentPeriodStart;
        break;
    }

    const currentExpenses = expenses.filter(expense => expense.date >= currentPeriodStart);
    const previousExpenses = expenses.filter(expense => 
      expense.date >= previousPeriodStart && expense.date < previousPeriodEnd
    );

    const current = this.generateExpenseAnalytics(currentExpenses);
    const previous = this.generateExpenseAnalytics(previousExpenses);

    const growth = previous.totalAmount > 0 
      ? ((current.totalAmount - previous.totalAmount) / previous.totalAmount) * 100
      : 0;

    return {
      current,
      previous,
      growth: Math.round(growth * 100) / 100,
    };
  }
}