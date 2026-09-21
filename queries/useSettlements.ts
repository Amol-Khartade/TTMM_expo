import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settlement } from '@/types';
import { expensesService } from '@/services/expensesService';

export function useGroupSettlementsQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      return await expensesService.getGroupSettlements(groupId);
    },
    enabled: !!groupId,
  });
}

export function useCreateSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settlementData: Omit<Settlement, 'id' | 'createdAt' | 'settledAt'>) => {
      return await expensesService.createSettlement(settlementData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', variables.groupId] });
    },
  });
}

export function useCompleteSettlementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ settlementId, groupId }: { settlementId: string; groupId: string }) => {
      return await expensesService.completeSettlement(settlementId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settlements', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', variables.groupId] });
    },
  });
}
