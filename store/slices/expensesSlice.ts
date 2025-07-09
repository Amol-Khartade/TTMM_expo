import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExpensesState, Expense, Balance, Settlement } from '@/types';
import { expensesService } from '@/services/expensesService';

const initialState: ExpensesState = {
  expenses: [],
  balances: [],
  settlements: [],
  loading: false,
  error: null,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (groupId: string) => {
    return await expensesService.getGroupExpenses(groupId);
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await expensesService.addExpense(expenseData);
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ expenseId, updates }: { expenseId: string; updates: Partial<Expense> }) => {
    return await expensesService.updateExpense(expenseId, updates);
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (expenseId: string) => {
    await expensesService.deleteExpense(expenseId);
    return expenseId;
  }
);

export const fetchBalances = createAsyncThunk(
  'expenses/fetchBalances',
  async (groupId: string) => {
    return await expensesService.getGroupBalances(groupId);
  }
);

export const createSettlement = createAsyncThunk(
  'expenses/createSettlement',
  async (settlementData: Omit<Settlement, 'id' | 'createdAt' | 'settledAt'>) => {
    return await expensesService.createSettlement(settlementData);
  }
);

export const completeSettlement = createAsyncThunk(
  'expenses/completeSettlement',
  async (settlementId: string) => {
    return await expensesService.completeSettlement(settlementId);
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      })
      .addCase(fetchBalances.fulfilled, (state, action) => {
        state.balances = action.payload;
      })
      .addCase(createSettlement.fulfilled, (state, action) => {
        state.settlements.push(action.payload);
      })
      .addCase(completeSettlement.fulfilled, (state, action) => {
        const index = state.settlements.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.settlements[index] = action.payload;
        }
      });
  },
});

export const { clearError } = expensesSlice.actions;
export default expensesSlice.reducer;