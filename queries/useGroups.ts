import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '@/services/groupsService';
import { Group } from '@/types';

export function useUserGroupsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await groupsService.getUserGroups(userId);
    },
    enabled: !!userId,
  });
}

export function useGroupDetailsQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      return await groupsService.getGroupDetails(groupId);
    },
    enabled: !!groupId,
  });
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      userId,
    }: {
      name: string;
      description?: string;
      userId: string;
    }) => {
      return await groupsService.createGroup(name, description || '', userId);
    },
    onSuccess: (newGroup: Group, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups', variables.userId] });
    },
  });
}
