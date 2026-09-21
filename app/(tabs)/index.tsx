import React, { useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, H2, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  Plus,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Receipt,
  Layers,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { useUserGroupsQuery, useCreateGroupMutation } from '@/queries/useGroups';
import { Group } from '@/types';
import {
  AmbientBackground,
  GlassCard,
  GroupCard,
  CreateGroupDialog,
  FloatingActionButton,
} from '@/components';

export default function GroupsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: groups = [], isLoading, refetch } = useUserGroupsQuery(currentUser?.id);
  const createGroupMutation = useCreateGroupMutation();

  const handleCreateGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    try {
      await createGroupMutation.mutateAsync({
        name,
        description,
        userId: currentUser.id,
      });
      setCreateModalOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.error('Failed to create group:', e);
    }
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Top Header */}
        <XStack justifyContent="space-between" alignItems="center" py="$2.5">
          <YStack>
            <XStack alignItems="center" gap="$2">
              <H2 fontWeight="900" color="$color" letterSpacing={-0.5} fontSize="$7">
                TTMM
              </H2>
              <YStack
                backgroundColor="$blue4"
                px="$2"
                py="$0.5"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$blue6"
              >
                <Text fontSize={10} fontWeight="800" color="$blue11" textTransform="uppercase">
                  PRO
                </Text>
              </YStack>
            </XStack>
            <Paragraph size="$2" color="$gray10" mt="$-1">
              Tera Tu Mera Mai • Split Seamlessly
            </Paragraph>
          </YStack>

          <Button
            size="$3"
            borderRadius="$6"
            backgroundColor="$blue10"
            color="white"
            icon={<Plus size={16} color="white" />}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setCreateModalOpen(true);
            }}
            pressStyle={{ opacity: 0.85, scale: 0.96 }}
            elevation={2}
          >
            <Text color="white" fontWeight="700" fontSize="$2">
              New Group
            </Text>
          </Button>
        </XStack>

        {/* Hero Glass Card: Net Balance Overview */}
        <MotiView
          from={{ opacity: 0, translateY: -8, scale: 0.98 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
        >
          <GlassCard
            variant="elevated"
            borderRadius={24}
            p={18}
            style={styles.heroCardMargin}
          >
            <XStack justifyContent="space-between" alignItems="center" mb="$3">
              <XStack alignItems="center" gap="$2">
                <YStack
                  backgroundColor={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)'}
                  p="$1.5"
                  borderRadius="$3"
                >
                  <Wallet size={16} color="#0284c7" />
                </YStack>
                <Text
                  fontSize={12}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing={0.8}
                  color="$gray11"
                >
                  Overall Standing
                </Text>
              </XStack>

              <XStack
                backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                px="$2"
                py="$0.5"
                borderRadius="$3"
              >
                <Text fontSize={11} fontWeight="700" color="$gray10">
                  {groups.length} {groups.length === 1 ? 'Group' : 'Groups'}
                </Text>
              </XStack>
            </XStack>

            {/* Split Metrics */}
            <XStack gap="$3">
              {/* You are owed */}
              <YStack
                flex={1}
                backgroundColor={isDark ? 'rgba(22, 101, 52, 0.18)' : 'rgba(220, 252, 231, 0.65)'}
                p="$3"
                borderRadius={16}
                borderWidth={1}
                borderColor={isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(187, 247, 208, 0.8)'}
              >
                <XStack alignItems="center" gap="$1.5" mb="$1">
                  <YStack backgroundColor="#22c55e" p="$1" borderRadius="$2">
                    <ArrowDownLeft size={12} color="white" />
                  </YStack>
                  <Paragraph size="$1" fontWeight="700" color="$gray10">
                    You are owed
                  </Paragraph>
                </XStack>
                <Text fontWeight="900" fontSize="$6" color="#16a34a">
                  {selectedCurrency} 0.00
                </Text>
              </YStack>

              {/* You owe */}
              <YStack
                flex={1}
                backgroundColor={isDark ? 'rgba(159, 18, 57, 0.18)' : 'rgba(255, 228, 230, 0.65)'}
                p="$3"
                borderRadius={16}
                borderWidth={1}
                borderColor={isDark ? 'rgba(244, 63, 94, 0.25)' : 'rgba(254, 205, 211, 0.8)'}
              >
                <XStack alignItems="center" gap="$1.5" mb="$1">
                  <YStack backgroundColor="#f43f5e" p="$1" borderRadius="$2">
                    <ArrowUpRight size={12} color="white" />
                  </YStack>
                  <Paragraph size="$1" fontWeight="700" color="$gray10">
                    You owe
                  </Paragraph>
                </XStack>
                <Text fontWeight="900" fontSize="$6" color="#e11d48">
                  {selectedCurrency} 0.00
                </Text>
              </YStack>
            </XStack>
          </GlassCard>
        </MotiView>

        {/* Groups Feed */}
        <YStack flex={1}>
          <XStack justifyContent="space-between" alignItems="center" mb="$3" px="$1">
            <XStack alignItems="center" gap="$2">
              <Layers size={16} color="#64748b" />
              <Text fontWeight="800" fontSize="$3" letterSpacing={0.5} color="$gray11">
                YOUR GROUPS
              </Text>
            </XStack>
            <Paragraph size="$2" color="$gray10" fontWeight="600">
              {groups.length} active
            </Paragraph>
          </XStack>

          <FlashList
            data={groups}
            renderItem={({ item, index }: { item: Group; index: number }) => (
              <GroupCard
                group={item}
                index={index}
                onPress={() => {
                  (router.push as any)({
                    pathname: '/group/[id]',
                    params: { id: item.id },
                  });
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor="#0284c7"
              />
            }
            ListEmptyComponent={
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 18 }}
              >
                <GlassCard variant="card" borderRadius={24} p={28} style={styles.emptyCard}>
                  <YStack alignItems="center" justifyContent="center">
                    <YStack
                      backgroundColor={isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'}
                      width={68}
                      height={68}
                      borderRadius={24}
                      alignItems="center"
                      justifyContent="center"
                      mb="$3"
                    >
                      <Users size={32} color="#0284c7" />
                    </YStack>
                    <Text fontWeight="800" fontSize="$5" textAlign="center" color="$color">
                      No groups yet
                    </Text>
                    <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1.5" px="$2">
                      Organize outings, weekend trips, rent & groceries with friends in one shared ledger.
                    </Paragraph>
                    <Button
                      mt="$4"
                      size="$3"
                      borderRadius="$6"
                      backgroundColor="$blue10"
                      color="white"
                      icon={<Plus size={16} color="white" />}
                      onPress={() => setCreateModalOpen(true)}
                    >
                      Create First Group
                    </Button>
                  </YStack>
                </GlassCard>
              </MotiView>
            }
          />
        </YStack>

        {/* Floating Add Expense Button */}
        <FloatingActionButton
          icon={Receipt}
          label="Add Expense"
          bottom={insets.bottom + 92}
          onPress={() => router.push('/expense/add')}
          accessibilityLabel="Add Expense"
        />

        {/* Create Group Modal Dialog */}
        <CreateGroupDialog
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSubmit={handleCreateGroup}
          isSubmitting={createGroupMutation.isPending}
        />
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  heroCardMargin: {
    marginBottom: 16,
  },
  emptyCard: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
