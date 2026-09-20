import { z } from 'zod';

export const expenseSplitSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  percentage: z.number().min(0).max(100).optional(),
  shares: z.number().int().min(1).optional(),
});

export const createExpenseSchema = z
  .object({
    title: z.string().min(2, 'Description must be at least 2 characters').max(100),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().default('INR'),
    groupId: z.string().min(1, 'Please select a group'),
    paidBy: z.string().min(1, 'Please select who paid'),
    category: z.enum([
      'food',
      'drinks',
      'groceries',
      'shopping',
      'transport',
      'entertainment',
      'utilities',
      'rent',
      'other',
    ]),
    splitType: z.enum(['equal', 'exact', 'percentage', 'shares', 'itemized']),
    splits: z.array(expenseSplitSchema).min(1, 'At least one member must be in the split'),
    date: z.date().default(() => new Date()),
    notes: z.string().max(500).optional(),
    receiptUrl: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.splitType === 'exact') {
        const totalSplits = data.splits.reduce((sum, s) => sum + s.amount, 0);
        return Math.abs(totalSplits - data.amount) < 0.01;
      }
      if (data.splitType === 'percentage') {
        const totalPct = data.splits.reduce((sum, s) => sum + (s.percentage ?? 0), 0);
        return Math.abs(totalPct - 100) < 0.1;
      }
      return true;
    },
    {
      message: 'Splits do not equal total expense amount',
      path: ['splits'],
    }
  );

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const settlementSchema = z.object({
  groupId: z.string().min(1, 'Group is required'),
  fromUserId: z.string().min(1, 'Payer is required'),
  toUserId: z.string().min(1, 'Recipient is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('INR'),
  paymentMethod: z.enum(['cash', 'upi', 'paypal', 'bank_transfer']),
  upiId: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export type SettlementInput = z.infer<typeof settlementSchema>;
