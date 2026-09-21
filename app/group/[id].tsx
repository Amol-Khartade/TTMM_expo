import React, { useState, useMemo } from 'react';
import { RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Button,
  H2,
  Paragraph,
  Switch,
} from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  ArrowLeft,
  Plus,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Receipt,
  Scale,
  UserPlus,
  Users,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGroupDetailsQuery, useAddMemberMutation } from '@/queries/useGroups';
import { useGroupExpensesQuery } from '@/queries/useExpenses';
import { useGroupSettlementsQuery } from '@/queries/useSettlements';
import { calculateNetBalances, simplifyDebts } from '@/services/debtSimplifier';
import { useAppStore } from '@/store/useAppStore';
import { Expense, GroupMember } from '@/types';
import {
  AmbientBackground,
  GlassCard,
  GroupHeroCard,
  SegmentedTabControl,
  ExpenseCard,
  SuggestedSettlementCard,
  MemberNetPositionRow,
  AddMemberDialog,
  FloatingActionButton,
} from '@/components';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const currentUser = useAppStore((state) => state.currentUser);
  const isDark = useAppStore((state) => state.isDark);

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [useSimplifiedDebts, setUseSimplifiedDebts] = useState(true);

  // Add Member Modal State
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const { data: group, isLoading: groupLoading } = useGroupDetailsQuery(id);
  const { data: expenses = [], isLoading: expLoading, refetch } = useGroupExpensesQuery(id);
  const { data: settlements = [] } = useGroupSettlementsQuery(id);
  const addMemberMutation = useAddMemberMutation();

  // Compute Balances, Simplified Debts, and Aggregates
  const { balancesMap, simplifiedDebts, totalGroupSpend, userNetBalance } = useMemo(() => {
    const bMap = calculateNetBalances(expenses, settlements, selectedCurrency);
    const debts = simplifyDebts(bMap, selectedCurrency);
    const totalSpend = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const userBal = currentUser ? bMap.get(currentUser.id)?.netBalance || 0 : 0;
    return {
      balancesMap: bMap,
      simplifiedDebts: debts,
      totalGroupSpend: totalSpend,
      userNetBalance: userBal,
    };
  }, [expenses, settlements, selectedCurrency, currentUser]);

  // Member net balances list sorted by net balance descending (creditors first)
  const memberBalancesList = useMemo(() => {
    if (!group?.members) return [];
    return group.members
      .map((member: GroupMember) => {
        const bal = balancesMap.get(member.userId);
        return {
          userId: member.userId,
          displayName: member.displayName,
          photoURL: member.photoURL,
          netBalance: bal ? bal.netBalance : 0,
          totalPaid: bal ? bal.totalPaid : 0,
          totalOwed: bal ? bal.totalOwed : 0,
        };
      })
      .sort((a, b) => b.netBalance - a.netBalance);
  }, [group?.members, balancesMap]);

  const memberName = (userId: string) => {
    const member = group?.members.find((m: GroupMember) => m.userId === userId);
    return member?.displayName || (userId === currentUser?.id ? 'You' : 'Member');
  };

  const handleAddMember = async (email: string) => {
    if (!id) return;
    try {
      setAddMemberError(null);
      await addMemberMutation.mutateAsync({
        groupId: id,
        email: email.toLowerCase(),
      });
      setAddMemberOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      setAddMemberError(err.message || 'User not found with this email');
    }
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Top Header Navigation */}
        <XStack alignItems="center" py="$2.5" justifyContent="space-between">
          <XStack alignItems="center" gap="$3" flex={1}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.back();
              }}
              style={({ pressed }) => [
                styles.navBackButton,
                { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)' },
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
            </Pressable>
            <YStack flex={1}>
              <H2 fontWeight="900" numberOfLines={1} fontSize="$6" color="$color" letterSpacing={-0.4}>
                {group?.name || 'Group Details'}
              </H2>
              <XStack alignItems="center" gap="$1.5" mt="$0.5">
                <Users size={12} color="#94a3b8" />
                <Paragraph size="$1" color="$gray10" fontWeight="600">
                  {group?.members?.length || 0} {group?.members?.length === 1 ? 'member' : 'members'}
                </Paragraph>
              </XStack>
            </YStack>
          </XStack>

          <Button
            size="$3"
            borderRadius="$6"
            backgroundColor={isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'}
            icon={<UserPlus size={16} color="#0284c7" />}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setAddMemberOpen(true);
            }}
            pressStyle={{ opacity: 0.8, scale: 0.96 }}
            borderWidth={1}
            borderColor={isDark ? 'rgba(2, 132, 199, 0.35)' : 'rgba(186, 230, 253, 0.8)'}
          >
            <Text fontWeight="800" color="#0284c7" fontSize="$2">
              + Member
            </Text>
          </Button>
        </XStack>

        {/* Hero Financial Overview Subcomponent */}
        <GroupHeroCard
          totalGroupSpend={totalGroupSpend}
          userNetBalance={userNetBalance}
          currency={selectedCurrency}
        />

        {/* Modern Segmented Tab Switcher Subcomponent */}
        <SegmentedTabControl
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
          tabs={[
            { id: 'expenses', label: 'Expenses', icon: Receipt, count: expenses.length },
            { id: 'balances', label: 'Balances & Settle', icon: Scale },
          ]}
        />

        {/* Tab Content */}
        {activeTab === 'expenses' ? (
          <YStack flex={1}>
            <FlashList
              data={expenses}
              renderItem={({ item, index }: { item: Expense; index: number }) => (
                <ExpenseCard
                  expense={item}
                  index={index}
                  currentUserId={currentUser?.id}
                  payerName={memberName(item.paidBy)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
              refreshControl={
                <RefreshControl
                  refreshing={expLoading}
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
                        width={64}
                        height={64}
                        borderRadius={22}
                        alignItems="center"
                        justifyContent="center"
                        mb="$3"
                      >
                        <DollarSign size={32} color="#0284c7" />
                      </YStack>
                      <Text fontWeight="800" fontSize="$5" color="$color">
                        No expenses yet
                      </Text>
                      <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1.5" px="$3">
                        Add dinners, drinks, cab rides, or tickets to start splitting automatically.
                      </Paragraph>
                      <Button
                        mt="$4"
                        borderRadius="$6"
                        backgroundColor="$blue10"
                        color="white"
                        size="$3"
                        icon={<Plus size={16} color="white" />}
                        onPress={() => {
                          (router.push as any)({
                            pathname: '/expense/add',
                            params: { groupId: id || '' },
                          });
                        }}
                      >
                        Add First Expense
                      </Button>
                    </YStack>
                  </GlassCard>
                </MotiView>
              }
            />
          </YStack>
        ) : (
          <YStack flex={1}>
            {/* Debt Simplification Card */}
            <GlassCard variant="card" borderRadius={20} p={14} style={styles.cardSpacing}>
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$2.5" alignItems="center" flex={1}>
                  <YStack backgroundColor="$blue5" p="$2" borderRadius="$3">
                    <Sparkles size={18} color="#0284c7" />
                  </YStack>
                  <YStack flex={1}>
                    <Text fontWeight="800" fontSize="$3" color="$color">
                      Smart Debt Simplification
                    </Text>
                    <Paragraph size="$1" color="$gray10">
                      Minimizes transactions via min-cash-flow algorithm
                    </Paragraph>
                  </YStack>
                </XStack>
                <Switch checked={useSimplifiedDebts} onCheckedChange={setUseSimplifiedDebts}>
                  <Switch.Thumb />
                </Switch>
              </XStack>
            </GlassCard>

            {/* Member Net Positions Breakdown */}
            <GlassCard variant="card" borderRadius={20} p={16} style={styles.cardSpacing}>
              <Text
                fontWeight="800"
                fontSize="$2"
                color="$gray10"
                mb="$2.5"
                textTransform="uppercase"
                letterSpacing={0.8}
              >
                Member Net Positions
              </Text>
              <YStack gap="$2">
                {memberBalancesList.map((m) => {
                  const isUser = m.userId === currentUser?.id;
                  const initials = m.displayName
                    ? m.displayName
                        .split(' ')
                        .map((p: string) => p[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '??';

                  return (
                    <MemberNetPositionRow
                      key={m.userId}
                      displayName={m.displayName}
                      initials={initials}
                      isCurrentUser={isUser}
                      totalPaid={m.totalPaid}
                      totalOwed={m.totalOwed}
                      netBalance={m.netBalance}
                      currency={selectedCurrency}
                    />
                  );
                })}
              </YStack>
            </GlassCard>

            {/* Suggested Settlements Section */}
            <Text
              fontWeight="800"
              fontSize="$2"
              color="$gray10"
              mb="$2"
              px="$1"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Suggested Settlements ({simplifiedDebts.length})
            </Text>

            <FlashList
              data={simplifiedDebts}
              keyExtractor={(_, index) => `debt-${index}`}
              contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
              renderItem={({ item, index }) => (
                <SuggestedSettlementCard
                  key={`debt-${index}`}
                  fromName={memberName(item.fromUserId)}
                  toName={memberName(item.toUserId)}
                  amount={item.amount}
                  currency={item.currency}
                  isPayer={item.fromUserId === currentUser?.id}
                  isReceiver={item.toUserId === currentUser?.id}
                  index={index}
                  onSettlePress={() => {
                    (router.push as any)({
                      pathname: '/settle/[id]',
                      params: {
                        id: id || '',
                        from: item.fromUserId,
                        to: item.toUserId,
                        amount: String(item.amount),
                      },
                    });
                  }}
                />
              )}
              ListEmptyComponent={
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 18 }}
                >
                  <GlassCard variant="card" borderRadius={24} p={28} style={styles.emptyCard}>
                    <YStack alignItems="center" justifyContent="center">
                      <YStack
                        backgroundColor={isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7'}
                        width={64}
                        height={64}
                        borderRadius={22}
                        alignItems="center"
                        justifyContent="center"
                        mb="$3"
                      >
                        <CheckCircle2 size={32} color="#16a34a" />
                      </YStack>
                      <Text mt="$2" fontWeight="900" fontSize="$5" color="#16a34a">
                        All Settled Up!
                      </Text>
                      <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1" px="$2">
                        Nobody in this group owes any money right now.
                      </Paragraph>
                    </YStack>
                  </GlassCard>
                </MotiView>
              }
            />
          </YStack>
        )}

        {/* Floating Add Expense Action Button */}
        <FloatingActionButton
          icon={Receipt}
          label="Add Expense"
          bottom={insets.bottom + 20}
          onPress={() => {
            (router.push as any)({
              pathname: '/expense/add',
              params: { groupId: id || '' },
            });
          }}
          accessibilityLabel="Add Expense to Group"
        />

        {/* Add Member Modal Dialog */}
        <AddMemberDialog
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          groupName={group?.name}
          onSubmit={handleAddMember}
          isSubmitting={addMemberMutation.isPending}
          error={addMemberError}
        />
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  navBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardSpacing: {
    marginBottom: 10,
  },
  emptyCard: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
