import { Expense, Settlement } from '@/types';

export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

export interface UserBalance {
  userId: string;
  netBalance: number; // positive = owed money, negative = owes money
  totalPaid: number;
  totalOwed: number;
}

/**
 * Calculates net balances for each user in a group based on expenses and settlements.
 */
export function calculateNetBalances(
  expenses: Expense[],
  settlements: Settlement[] = [],
  currency: string = 'INR'
): Map<string, UserBalance> {
  const balances = new Map<string, UserBalance>();

  const getOrCreate = (userId: string): UserBalance => {
    if (!balances.has(userId)) {
      balances.set(userId, {
        userId,
        netBalance: 0,
        totalPaid: 0,
        totalOwed: 0,
      });
    }
    return balances.get(userId)!;
  };

  // Process all expenses
  for (const exp of expenses) {
    if (exp.currency !== currency && currency !== 'ALL') {
      // For now assume single currency or convert beforehand
    }
    const payer = getOrCreate(exp.paidBy);
    payer.totalPaid += exp.amount;
    payer.netBalance += exp.amount;

    for (const split of exp.splitDetails) {
      const debtor = getOrCreate(split.userId);
      debtor.totalOwed += split.amount;
      debtor.netBalance -= split.amount;
    }
  }

  // Process all completed settlements
  for (const set of settlements) {
    if (set.status !== 'completed') continue;
    const payer = getOrCreate(set.fromUserId);
    const recipient = getOrCreate(set.toUserId);

    payer.netBalance += set.amount;
    recipient.netBalance -= set.amount;
  }

  // Round all numbers to 2 decimal places to prevent floating-point artifacts
  for (const [userId, bal] of balances.entries()) {
    balances.set(userId, {
      userId,
      netBalance: Math.round(bal.netBalance * 100) / 100,
      totalPaid: Math.round(bal.totalPaid * 100) / 100,
      totalOwed: Math.round(bal.totalOwed * 100) / 100,
    });
  }

  return balances;
}

/**
 * Minimum Cash Flow Algorithm (Debt Simplification)
 * Computes the minimum number of transactions needed to settle all debts in a group.
 */
export function simplifyDebts(
  balancesMap: Map<string, UserBalance>,
  currency: string = 'INR'
): SimplifiedDebt[] {
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  balancesMap.forEach((bal, userId) => {
    if (bal.netBalance > 0.01) {
      creditors.push({ userId, amount: bal.netBalance });
    } else if (bal.netBalance < -0.01) {
      debtors.push({ userId, amount: -bal.netBalance });
    }
  });

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];

  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settledAmount = Math.min(creditor.amount, debtor.amount);
    const roundedAmount = Math.round(settledAmount * 100) / 100;

    if (roundedAmount > 0) {
      simplified.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: roundedAmount,
        currency,
      });
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return simplified;
}
