import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/services/expensesService';
import { Expense } from '@/types';

export function useGroupExpensesQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      return await expensesService.getGroupExpenses(groupId);
    },
    enabled: !!groupId,
  });
}

export function useAddExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await expensesService.addExpense(expenseData);
    },
    onMutate: async (newExpense) => {
      // Cancel ongoing queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['expenses', newExpense.groupId] });

      const previousExpenses = queryClient.getQueryData<Expense[]>(['expenses', newExpense.groupId]);

      // Optimistic update with temporary ID
      const optimisticExpense: Expense = {
        ...newExpense,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<Expense[]>(['expenses', newExpense.groupId], (old = []) => [
        optimisticExpense,
        ...old,
      ]);

      return { previousExpenses };
    },
    onError: (_err, newExpense, context) => {
      // Rollback on failure
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses', newExpense.groupId], context.previousExpenses);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Re-fetch from server to guarantee sync
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', variables.groupId] });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ expenseId, groupId }: { expenseId: string; groupId: string }) => {
      return await expensesService.deleteExpense(expenseId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', variables.groupId] });
    },
  });
}
