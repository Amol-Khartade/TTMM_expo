import {
  CreateExpenseData,
  expenseService,
  UpdateExpenseData,
} from '@/services/expenseService';
import { Expense, ExpensesState } from '@/types';
import { ExpenseCalculations } from '@/utils/expenseCalculations';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Enhanced initial state with caching and pagination
interface EnhancedExpensesState extends ExpensesState {
  currentGroupId: string | null;
  hasMoreExpenses: boolean;
  lastLoadedExpense: Expense | null;
  isLoadingMore: boolean;
  analytics: any;
  filters: {
    category: string | null;
    dateFrom: Date | null;
    dateTo: Date | null;
    searchTerm: string | null;
  };
}

const initialState: EnhancedExpensesState = {
  expenses: [],
  balances: [],
  settlements: [],
  loading: false,
  error: null,
  // Additional state for optimization
  currentGroupId: null,
  hasMoreExpenses: true,
  lastLoadedExpense: null,
  isLoadingMore: false,
  analytics: null,
  filters: {
    category: null,
    dateFrom: null,
    dateTo: null,
    searchTerm: null,
  },
};

// Async thunks with proper error handling and optimization
export const fetchGroupExpenses = createAsyncThunk(
  'expenses/fetchGroupExpenses',
  async (
    { groupId, refresh = false }: { groupId: string; refresh?: boolean },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { expenses: EnhancedExpensesState };
      const currentState = state.expenses;

      // Use cached data if available and not refreshing
      if (
        !refresh &&
        currentState.currentGroupId === groupId &&
        currentState.expenses.length > 0
      ) {
        return { expenses: currentState.expenses, fromCache: true };
      }

      const expenses = await expenseService.getGroupExpenses(groupId, 20);
      return { expenses, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch expenses'
      );
    }
  }
);

export const loadMoreExpenses = createAsyncThunk(
  'expenses/loadMoreExpenses',
  async (groupId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { expenses: EnhancedExpensesState };
      const currentState = state.expenses;

      if (!currentState.hasMoreExpenses || currentState.isLoadingMore) {
        return [];
      }

      const lastExpense =
        currentState.expenses[currentState.expenses.length - 1];
      const moreExpenses = await expenseService.getGroupExpenses(
        groupId,
        20,
        lastExpense
      );

      return moreExpenses;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to load more expenses'
      );
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: CreateExpenseData, { rejectWithValue }) => {
    try {
      const expense = await expenseService.createExpense(expenseData);
      return expense;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create expense'
      );
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (updateData: UpdateExpenseData, { rejectWithValue }) => {
    try {
      const expense = await expenseService.updateExpense(updateData);
      return expense;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update expense'
      );
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      const success = await expenseService.deleteExpense(expenseId);
      if (!success) {
        throw new Error('Failed to delete expense');
      }
      return expenseId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete expense'
      );
    }
  }
);

export const fetchGroupBalances = createAsyncThunk(
  'expenses/fetchGroupBalances',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const balances = await expenseService.getGroupBalances(groupId);
      return balances;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch balances'
      );
    }
  }
);

export const calculateSettlements = createAsyncThunk(
  'expenses/calculateSettlements',
  async (groupId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { expenses: EnhancedExpensesState };
      const expenses = state.expenses.expenses.filter(
        (expense) => expense.groupId === groupId
      );

      if (expenses.length === 0) {
        return [];
      }

      const balances = ExpenseCalculations.calculateGroupBalances(expenses);
      const settlements = ExpenseCalculations.calculateSettlements(balances);

      return settlements;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to calculate settlements'
      );
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // Clear all expense data
    clearExpenses: (state) => {
      return { ...initialState };
    },

    // Clear error state
    clearError: (state) => {
      state.error = null;
    },

    // Set filters for expenses
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        category: null,
        dateFrom: null,
        dateTo: null,
        searchTerm: null,
      };
    },

    // Optimistic update for creating expense
    optimisticCreateExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift({ ...action.payload, id: `temp-${Date.now()}` });
    },

    // Optimistic update for deleting expense
    optimisticDeleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },

    // Real-time expense updates
    addExpenseFromSubscription: (state, action: PayloadAction<Expense>) => {
      const existingIndex = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.expenses[existingIndex] = action.payload;
      } else {
        state.expenses.unshift(action.payload);
      }
    },

    // Remove expense from real-time updates
    removeExpenseFromSubscription: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },

    // Update analytics
    updateAnalytics: (state) => {
      if (state.expenses.length > 0) {
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch group expenses
    builder
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        state.loading = false;
        const { expenses, fromCache } = action.payload;

        if (!fromCache) {
          state.expenses = expenses;
          state.currentGroupId =
            expenses.length > 0 ? expenses[0].groupId : null;
          state.hasMoreExpenses = expenses.length === 20;
          state.lastLoadedExpense =
            expenses.length > 0 ? expenses[expenses.length - 1] : null;
        }

        // Update analytics
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load more expenses
      .addCase(loadMoreExpenses.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreExpenses.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        const moreExpenses = action.payload;

        if (moreExpenses.length > 0) {
          state.expenses.push(...moreExpenses);
          state.lastLoadedExpense = moreExpenses[moreExpenses.length - 1];
          state.hasMoreExpenses = moreExpenses.length === 20;
        } else {
          state.hasMoreExpenses = false;
        }

        // Update analytics
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      })
      .addCase(loadMoreExpenses.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      })

      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;

        // Remove optimistic update if it exists
        state.expenses = state.expenses.filter(
          (expense) => !expense.id.startsWith('temp-')
        );

        // Add the real expense
        state.expenses.unshift(action.payload);

        // Update analytics
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        // Remove failed optimistic update
        state.expenses = state.expenses.filter(
          (expense) => !expense.id.startsWith('temp-')
        );
      })

      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const updatedExpense = action.payload;
        const index = state.expenses.findIndex(
          (expense) => expense.id === updatedExpense.id
        );

        if (index >= 0) {
          state.expenses[index] = updatedExpense;
        }

        // Update analytics
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== deletedId
        );

        // Update analytics
        state.analytics = ExpenseCalculations.generateExpenseAnalytics(
          state.expenses
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch balances
      .addCase(fetchGroupBalances.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.balances = action.payload;
      })
      .addCase(fetchGroupBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Calculate settlements
      .addCase(calculateSettlements.fulfilled, (state, action) => {
        state.settlements = action.payload;
      });
  },
});

export const {
  clearExpenses,
  clearError,
  setFilters,
  clearFilters,
  optimisticCreateExpense,
  optimisticDeleteExpense,
  addExpenseFromSubscription,
  removeExpenseFromSubscription,
  updateAnalytics,
} = expensesSlice.actions;

export default expensesSlice.reducer;
