import React, { useState, useMemo } from 'react';
import { RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, H2, Paragraph, Dialog, Input } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  Plus,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Sparkles,
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
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';

// Color themes for groups
const GROUP_PALETTES = [
  { bg: '#e0f2fe', iconBg: '#0284c7', text: '#0369a1', glow: 'rgba(2, 132, 199, 0.25)' }, // Sky
  { bg: '#ede9fe', iconBg: '#7c3aed', text: '#6d28d9', glow: 'rgba(124, 58, 237, 0.25)' }, // Purple
  { bg: '#dcfce7', iconBg: '#16a34a', text: '#15803d', glow: 'rgba(22, 163, 74, 0.25)' },  // Emerald
  { bg: '#fef3c7', iconBg: '#d97706', text: '#b45309', glow: 'rgba(217, 119, 6, 0.25)' },  // Amber
  { bg: '#ffe4e6', iconBg: '#e11d48', text: '#be123c', glow: 'rgba(225, 29, 72, 0.25)' },  // Rose
  { bg: '#ccfbf1', iconBg: '#0d9488', text: '#0f766e', glow: 'rgba(13, 148, 136, 0.25)' }, // Teal
];

const getGroupTheme = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GROUP_PALETTES.length;
  return GROUP_PALETTES[index];
};

export default function GroupsTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const { data: groups = [], isLoading, refetch } = useUserGroupsQuery(currentUser?.id);
  const createGroupMutation = useCreateGroupMutation();

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !currentUser) return;
    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        userId: currentUser.id,
      });
      setNewGroupName('');
      setNewGroupDesc('');
      setCreateModalOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      console.error('Failed to create group:', e);
    }
  };

  const renderGroupItem = ({ item, index }: { item: Group; index: number }) => {
    const theme = getGroupTheme(item.name);

    return (
      <GlassCard
        key={item.id}
        variant="card"
        borderRadius={20}
        p={14}
        animate
        delay={index * 55}
        style={styles.groupCardMargin}
        onPress={() => {
          (router.push as any)({
            pathname: '/group/[id]',
            params: { id: item.id },
          });
        }}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack
              backgroundColor={theme.bg}
              width={46}
              height={46}
              borderRadius={14}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={theme.glow}
            >
              <Users size={22} color={theme.iconBg} />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="800" fontSize="$4" numberOfLines={1} color="$color">
                {item.name}
              </Text>
              <XStack alignItems="center" gap="$1.5" mt="$0.5">
                <Text fontSize={12} color="$gray10">
                  {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
                </Text>
                {item.description ? (
                  <>
                    <Text fontSize={10} color="$gray8">
                      •
                    </Text>
                    <Text fontSize={12} color="$gray10" numberOfLines={1} flex={1}>
                      {item.description}
                    </Text>
                  </>
                ) : null}
              </XStack>
            </YStack>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <YStack
              backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
              p="$1.5"
              borderRadius="$3"
            >
              <ChevronRight size={18} color="#94a3b8" />
            </YStack>
          </XStack>
        </XStack>
      </GlassCard>
    );
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

        {/* Groups List */}
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
            renderItem={renderGroupItem}
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
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 200 }}
          style={[styles.fabContainer, { bottom: insets.bottom + 92 }]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              router.push('/expense/add');
            }}
            style={({ pressed }) => [
              styles.fabButton,
              pressed && { transform: [{ scale: 0.92 }], opacity: 0.9 },
            ]}
          >
            <Receipt size={22} color="white" />
            <Text color="white" fontWeight="800" fontSize="$3">
              Add Expense
            </Text>
          </Pressable>
        </MotiView>

        {/* Create Group Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              opacity={0.65}
              backgroundColor="rgba(0,0,0,0.6)"
            />
            <Dialog.Content
              key="content"
              p="$4"
              width="90%"
              borderRadius={24}
              backgroundColor={isDark ? '#1e293b' : '#ffffff'}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
              elevation={8}
            >
              <Dialog.Title fontWeight="800" fontSize="$5" color="$color">
                Create New Group
              </Dialog.Title>
              <Dialog.Description size="$2" color="$gray10" mb="$3.5">
                Organize your trip, flat, or outing with friends.
              </Dialog.Description>

              <Input
                placeholder="Group Name (e.g. Goa Trip 2026)"
                value={newGroupName}
                onChangeText={setNewGroupName}
                mb="$3"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$gray6"
                backgroundColor={isDark ? '#0f172a' : '$gray2'}
              />
              <Input
                placeholder="Description (Optional)"
                value={newGroupDesc}
                onChangeText={setNewGroupDesc}
                mb="$4"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$gray6"
                backgroundColor={isDark ? '#0f172a' : '$gray2'}
              />

              <XStack justifyContent="flex-end" gap="$2.5">
                <Button
                  chromeless
                  borderRadius="$4"
                  onPress={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="$blue10"
                  color="white"
                  borderRadius="$4"
                  onPress={handleCreateGroup}
                  disabled={!newGroupName.trim() || createGroupMutation.isPending}
                >
                  <Text color="white" fontWeight="700">
                    {createGroupMutation.isPending ? 'Creating...' : 'Create'}
                  </Text>
                </Button>
              </XStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  groupCardMargin: {
    marginBottom: 12,
  },
  heroCardMargin: {
    marginBottom: 16,
  },
  emptyCard: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 99,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
