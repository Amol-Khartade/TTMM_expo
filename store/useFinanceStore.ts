import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './useAppStore';
import { Bill, SavingsGoal, DetectedPaymentApp } from '@/types';
import { ENV } from '@/constants';

export interface FinanceState {
  // Budget & Preferences
  monthlyBudget: number;
  budgetAlertThreshold: number; // 0.8 = 80%
  budgetAlertsEnabled: boolean;
  primaryUpiId: string;
  preferredPaymentApp: DetectedPaymentApp;
  customCategories: string[];

  // Bills
  bills: Bill[];

  // Savings Goals
  savingsGoals: SavingsGoal[];

  // Actions - Budget & Preferences
  setMonthlyBudget: (amount: number) => void;
  setBudgetAlertThreshold: (threshold: number) => void;
  setBudgetAlertsEnabled: (enabled: boolean) => void;
  setPrimaryUpiId: (upiId: string) => void;
  setPreferredPaymentApp: (app: DetectedPaymentApp) => void;
  addCustomCategory: (category: string) => void;

  // Actions - Bills
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'status'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (id: string) => void;
  resetBillStatus: (id: string) => void;

  // Actions - Savings
  addSavingsGoal: (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'deposits' | 'currentSaved'> & {
      initialDeposit?: number;
    }
  ) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsDeposit: (goalId: string, amount: number, note?: string) => void;
}

const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill-1',
    title: 'Apartment Rent',
    amount: 15000,
    currency: ENV.DEFAULTS.CURRENCY,
    dueDay: 5,
    category: 'rent',
    frequency: 'monthly',
    payeeUpiId: 'landlord@okhdfcbank',
    payeeName: 'Rajesh Sharma',
    status: 'unpaid',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-2',
    title: 'High-Speed Fiber Wi-Fi',
    amount: 999,
    currency: ENV.DEFAULTS.CURRENCY,
    dueDay: 12,
    category: 'utilities',
    frequency: 'monthly',
    payeeUpiId: 'airtel@upi',
    payeeName: 'Airtel Broadband',
    status: 'paid',
    lastPaidDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-3',
    title: 'Electricity Bill (MSEB)',
    amount: 1850,
    currency: ENV.DEFAULTS.CURRENCY,
    dueDay: 22,
    category: 'utilities',
    frequency: 'monthly',
    payeeUpiId: 'mseb@sbi',
    payeeName: 'Mahavitaran',
    status: 'unpaid',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SAVINGS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Goa Friends Trip',
    targetAmount: 35000,
    currentSaved: 21000,
    currency: ENV.DEFAULTS.CURRENCY,
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'travel',
    color: '#06b6d4',
    deposits: [
      { id: 'dep-1', amount: 10000, date: new Date().toISOString(), note: 'Initial allocation' },
      { id: 'dep-2', amount: 11000, date: new Date().toISOString(), note: 'Bonus split' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    title: 'Emergency Rainy Day Fund',
    targetAmount: 100000,
    currentSaved: 48000,
    currency: ENV.DEFAULTS.CURRENCY,
    category: 'other',
    color: '#10b981',
    deposits: [
      { id: 'dep-3', amount: 48000, date: new Date().toISOString(), note: 'Monthly savings' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      monthlyBudget: 35000,
      budgetAlertThreshold: 0.8,
      budgetAlertsEnabled: true,
      primaryUpiId: '',
      preferredPaymentApp: 'google_pay',
      customCategories: [],

      bills: INITIAL_BILLS,
      savingsGoals: INITIAL_SAVINGS,

      setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),
      setBudgetAlertThreshold: (threshold) => set({ budgetAlertThreshold: threshold }),
      setBudgetAlertsEnabled: (enabled) => set({ budgetAlertsEnabled: enabled }),
      setPrimaryUpiId: (upiId) => set({ primaryUpiId: upiId }),
      setPreferredPaymentApp: (app) => set({ preferredPaymentApp: app }),
      addCustomCategory: (category) =>
        set((state) => ({
          customCategories: Array.from(new Set([...state.customCategories, category])),
        })),

      addBill: (billData) =>
        set((state) => ({
          bills: [
            {
              ...billData,
              id: `bill-${Date.now()}`,
              status: 'unpaid',
              createdAt: new Date().toISOString(),
            },
            ...state.bills,
          ],
        })),

      updateBill: (id, updates) =>
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        })),

      markBillPaid: (id) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: 'paid',
                  lastPaidDate: new Date().toISOString(),
                }
              : b
          ),
        })),

      resetBillStatus: (id) =>
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, status: 'unpaid' } : b)),
        })),

      addSavingsGoal: (goalData) =>
        set((state) => {
          const initial = goalData.initialDeposit || 0;
          return {
            savingsGoals: [
              {
                id: `goal-${Date.now()}`,
                title: goalData.title,
                targetAmount: goalData.targetAmount,
                currentSaved: initial,
                currency: goalData.currency || ENV.DEFAULTS.CURRENCY,
                targetDate: goalData.targetDate,
                category: goalData.category || 'other',
                color: goalData.color || '#3b82f6',
                deposits: initial > 0
                  ? [
                      {
                        id: `dep-${Date.now()}`,
                        amount: initial,
                        date: new Date().toISOString(),
                        note: 'Opening deposit',
                      },
                    ]
                  : [],
                createdAt: new Date().toISOString(),
              },
              ...state.savingsGoals,
            ],
          };
        }),

      updateSavingsGoal: (id, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),

      addSavingsDeposit: (goalId, amount, note) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => {
            if (g.id !== goalId) return g;
            const newDeposit = {
              id: `dep-${Date.now()}`,
              amount,
              date: new Date().toISOString(),
              note: note || 'Contribution',
            };
            return {
              ...g,
              currentSaved: g.currentSaved + amount,
              deposits: [newDeposit, ...g.deposits],
            };
          }),
        })),
    }),
    {
      name: 'ttmm-finance-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
