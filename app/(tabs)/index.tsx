import React, { useState } from 'react';
import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, Card, H2, Paragraph, Dialog, Input } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, ChevronRight } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useUserGroupsQuery, useCreateGroupMutation } from '@/queries/useGroups';
import { Group } from '@/types';

export default function GroupsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const { data: groups = [], isLoading, refetch } = useUserGroupsQuery(currentUser?.id);
  const createGroupMutation = useCreateGroupMutation();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    await createGroupMutation.mutateAsync({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      userId: currentUser.id,
    });
    setNewGroupName('');
    setNewGroupDesc('');
    setCreateModalOpen(false);
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      <Card
        borderWidth={1}
        borderColor="#e2e8f0"
        borderRadius="$5"
        mb="$3"
        p="$4"
        pressStyle={{ scale: 0.98 }}
        onPress={() =>
          (router.push as any)({
            pathname: '/group/[id]',
            params: { id: item.id },
          })
        }
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack
              backgroundColor="$blue5"
              p="$2.5"
              borderRadius="$4"
              alignItems="center"
              justifyContent="center"
            >
              <Users size={22} color="#0284c7" />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="700" fontSize="$5" numberOfLines={1}>
                {item.name}
              </Text>
              <Paragraph size="$2" color="$gray10" numberOfLines={1}>
                {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
              </Paragraph>
            </YStack>
          </XStack>
          <ChevronRight size={20} color="#94a3b8" />
        </XStack>
      </Card>
    </MotiView>
  );

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      {/* Top Header */}
      <XStack justifyContent="space-between" alignItems="center" py="$3">
        <YStack>
          <H2 fontWeight="900" color="$color">
            TTMM
          </H2>
          <Paragraph size="$2" color="$gray10">
            Tera Tu Mera Mai • Splitwise Alternative
          </Paragraph>
        </YStack>
        <Button
          size="$3"
          theme="active"
          icon={<Plus size={16} />}
          onPress={() => setCreateModalOpen(true)}
          borderRadius="$6"
        >
          New Group
        </Button>
      </XStack>

      {/* Overview Balance Card */}
      <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" backgroundColor="$blue2" borderRadius="$6">
        <Paragraph size="$2" textTransform="uppercase" fontWeight="700" color="$blue11">
          Overall Status
        </Paragraph>
        <XStack justifyContent="space-between" alignItems="center" mt="$2">
          <XStack alignItems="center" gap="$2">
            <YStack backgroundColor="$green4" p="$1.5" borderRadius="$3">
              <ArrowDownLeft size={16} color="#16a34a" />
            </YStack>
            <YStack>
              <Paragraph size="$1" color="$gray10">
                You are owed
              </Paragraph>
              <Text fontWeight="800" fontSize="$5" color="$green10">
                {selectedCurrency} 0.00
              </Text>
            </YStack>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <YStack backgroundColor="$red4" p="$1.5" borderRadius="$3">
              <ArrowUpRight size={16} color="#dc2626" />
            </YStack>
            <YStack>
              <Paragraph size="$1" color="$gray10">
                You owe
              </Paragraph>
              <Text fontWeight="800" fontSize="$5" color="$red10">
                {selectedCurrency} 0.00
              </Text>
            </YStack>
          </XStack>
        </XStack>
      </Card>

      {/* Groups List with FlashList */}
      <YStack flex={1}>
        <XStack justifyContent="space-between" alignItems="center" mb="$2">
          <Text fontWeight="700" fontSize="$4" color="$gray11">
            YOUR GROUPS
          </Text>
          <Paragraph size="$2" color="$gray10">
            {groups.length} active
          </Paragraph>
        </XStack>

        <FlashList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            <YStack alignItems="center" justifyContent="center" py="$8" px="$4">
              <Users size={48} color="#94a3b8" />
              <Text mt="$3" fontWeight="700" fontSize="$5" textAlign="center">
                No groups yet
              </Text>
              <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1">
                Create a group to start splitting bills and tracking settlements with friends.
              </Paragraph>
              <Button
                mt="$4"
                theme="active"
                icon={<Plus size={16} />}
                onPress={() => setCreateModalOpen(true)}
              >
                Create First Group
              </Button>
            </YStack>
          }
        />
      </YStack>

      {/* Floating Add Expense Button */}
      <Button
        position="absolute"
        bottom={insets.bottom + 16}
        right={16}
        size="$5"
        circular
        theme="active"
        icon={<Plus size={24} />}
        onPress={() => router.push('/expense/add')}
      />

      {/* Create Group Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay key="overlay" opacity={0.5} />
          <Dialog.Content key="content" p="$4" width="90%" borderWidth={1} borderColor="#e2e8f0" borderRadius="$5">
            <Dialog.Title>Create New Group</Dialog.Title>
            <Dialog.Description size="$2" color="$gray10" mb="$3">
              Organize your trip, flat, or outing with friends.
            </Dialog.Description>
            <Input
              placeholder="Group Name (e.g. Goa Trip 2026)"
              value={newGroupName}
              onChangeText={setNewGroupName}
              mb="$3"
            />
            <Input
              placeholder="Description (Optional)"
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              mb="$4"
            />
            <XStack justifyContent="flex-end" gap="$2">
              <Button chromeless onPress={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                theme="active"
                onPress={handleCreateGroup}
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
