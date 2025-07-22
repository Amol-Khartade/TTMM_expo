import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { RootState, AppDispatch } from '@/store';
import {
  fetchGroupExpenses,
  loadMoreExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  optimisticCreateExpense,
  optimisticDeleteExpense,
  addExpenseFromSubscription,
  removeExpenseFromSubscription,
  setFilters,
  clearFilters,
} from '@/store/slices/expensesSlice';
import { expenseService } from '@/services/expenseService';
import { Expense } from '@/types';
import { CreateExpenseData, UpdateExpenseData } from '@/services/expenseService';

interface UseExpensesOptions {
  groupId?: string;
  enableRealtime?: boolean;
  autoLoad?: boolean;
}

export const useExpenses = (options: UseExpensesOptions = {}) => {
  const { groupId, enableRealtime = false, autoLoad = true } = options;
  
  const dispatch = useDispatch<AppDispatch>();
  const {
    expenses,
    loading,
    isLoadingMore,
    hasMoreExpenses,
    error,
    filters,
    analytics,
    currentGroupId,
  } = useSelector((state: RootState) => state.expenses);

  const [realtimeSubscription, setRealtimeSubscription] = useState<(() => void) | null>(null);

  // Load expenses when groupId changes
  useEffect(() => {
    if (autoLoad && groupId && groupId !== currentGroupId) {
      dispatch(fetchGroupExpenses({ groupId, refresh: true }));
    }
  }, [dispatch, groupId, currentGroupId, autoLoad]);

  // Setup real-time subscription
  useEffect(() => {
    if (!enableRealtime || !groupId) return;

    // Clean up existing subscription
    if (realtimeSubscription) {
      realtimeSubscription();
      setRealtimeSubscription(null);
    }

    // Setup new subscription
    const unsubscribe = expenseService.subscribeToGroupExpenses(
      groupId,
      (updatedExpenses) => {
        // Handle real-time updates
        updatedExpenses.forEach(expense => {
          dispatch(addExpenseFromSubscription(expense));
        });
      }
    );

    setRealtimeSubscription(() => unsubscribe);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, groupId, enableRealtime, realtimeSubscription]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription();
      }
    };
  }, [realtimeSubscription]);

  // Refresh expenses
  const refreshExpenses = useCallback(async () => {
    if (!groupId) return false;

    try {
      await dispatch(fetchGroupExpenses({ groupId, refresh: true })).unwrap();
      return true;
    } catch (error) {
      console.error('Error refreshing expenses:', error);
      return false;
    }
  }, [dispatch, groupId]);

  // Load more expenses
  const loadMore = useCallback(async () => {
    if (!groupId || !hasMoreExpenses || isLoadingMore) return false;

    try {
      await dispatch(loadMoreExpenses(groupId)).unwrap();
      return true;
    } catch (error) {
      console.error('Error loading more expenses:', error);
      return false;
    }
  }, [dispatch, groupId, hasMoreExpenses, isLoadingMore]);

  // Create new expense with optimistic updates
  const createExpenseOptimistic = useCallback(async (expenseData: CreateExpenseData) => {
    try {
      // Create optimistic expense
      const optimisticExpense: Expense = {
        id: `temp-${Date.now()}`,
        ...expenseData,
        createdBy: expenseData.paidBy, // Temporary
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Apply optimistic update
      dispatch(optimisticCreateExpense(optimisticExpense));

      // Create actual expense
      const result = await dispatch(createExpense(expenseData)).unwrap();
      return { success: true, expense: result };
    } catch (error) {
      console.error('Error creating expense:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create expense' 
      };
    }
  }, [dispatch]);

  // Update expense
  const updateExpenseAction = useCallback(async (updateData: UpdateExpenseData) => {
    try {
      const result = await dispatch(updateExpense(updateData)).unwrap();
      return { success: true, expense: result };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update expense' 
      };
    }
  }, [dispatch]);

  // Delete expense with optimistic updates
  const deleteExpenseOptimistic = useCallback(async (expenseId: string) => {
    try {
      // Apply optimistic delete
      dispatch(optimisticDeleteExpense(expenseId));

      // Delete actual expense
      await dispatch(deleteExpense(expenseId)).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Refresh to restore the expense if deletion failed
      if (groupId) {
        dispatch(fetchGroupExpenses({ groupId, refresh: true }));
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete expense' 
      };
    }
  }, [dispatch, groupId]);

  // Get expense by ID
  const getExpenseById = useCallback(async (expenseId: string) => {
    try {
      const expense = await expenseService.getExpenseById(expenseId);
      return { success: true, expense };
    } catch (error) {
      console.error('Error getting expense:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get expense' 
      };
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  // Clear filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Bulk operations
  const deleteMultipleExpenses = useCallback(async (expenseIds: string[]) => {
    const results = await Promise.allSettled(
      expenseIds.map(id => deleteExpenseOptimistic(id))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;

    if (failed > 0) {
      Alert.alert(
        'Partial Success',
        `${successful} expenses deleted successfully. ${failed} failed to delete.`
      );
    }

    return { successful, failed };
  }, [deleteExpenseOptimistic]);

  // Get filtered expenses
  const getFilteredExpenses = useCallback((customFilters?: typeof filters) => {
    const activeFilters = customFilters || filters;
    
    return expenses.filter(expense => {
      if (activeFilters.category && expense.category !== activeFilters.category) {
        return false;
      }
      
      if (activeFilters.dateFrom && expense.date < activeFilters.dateFrom) {
        return false;
      }
      
      if (activeFilters.dateTo && expense.date > activeFilters.dateTo) {
        return false;
      }
      
      if (activeFilters.searchTerm) {
        const searchLower = activeFilters.searchTerm.toLowerCase();
        return expense.title.toLowerCase().includes(searchLower) ||
               (expense.description && expense.description.toLowerCase().includes(searchLower));
      }
      
      return true;
    });
  }, [expenses, filters]);

  // Error handling helper
  const handleExpenseError = useCallback((error: any, action: string) => {
    const message = error instanceof Error ? error.message : `Failed to ${action}`;
    Alert.alert('Error', message);
  }, []);

  return {
    // Data
    expenses,
    filteredExpenses: getFilteredExpenses(),
    loading,
    isLoadingMore,
    hasMoreExpenses,
    error,
    filters,
    analytics,
    currentGroupId,

    // Actions
    refreshExpenses,
    loadMore,
    createExpense: createExpenseOptimistic,
    updateExpense: updateExpenseAction,
    deleteExpense: deleteExpenseOptimistic,
    deleteMultipleExpenses,
    getExpenseById,

    // Filters
    updateFilters,
    resetFilters,
    getFilteredExpenses,

    // Utils
    handleExpenseError,
  };
};