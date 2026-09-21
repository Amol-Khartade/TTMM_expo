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
  Dialog,
  Input,
} from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  ArrowLeft,
  Plus,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Scale,
  UserPlus,
  Users,
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Film,
  Wallet,
  AlertCircle,
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
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';

// Map expense category to modern icon & pastel color background
const getCategoryMeta = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (
    cat.includes('food') ||
    cat.includes('meal') ||
    cat.includes('dining') ||
    cat.includes('dinner') ||
    cat.includes('lunch')
  ) {
    return { icon: Utensils, bg: '#ffedd5', color: '#ea580c' }; // orange
  }
  if (
    cat.includes('drink') ||
    cat.includes('coffee') ||
    cat.includes('bar') ||
    cat.includes('tea') ||
    cat.includes('cafe')
  ) {
    return { icon: Coffee, bg: '#fef3c7', color: '#d97706' }; // amber
  }
  if (
    cat.includes('transport') ||
    cat.includes('cab') ||
    cat.includes('uber') ||
    cat.includes('travel') ||
    cat.includes('trip') ||
    cat.includes('fuel') ||
    cat.includes('flight')
  ) {
    return { icon: Car, bg: '#e0f2fe', color: '#0284c7' }; // sky blue
  }
  if (
    cat.includes('shopping') ||
    cat.includes('grocery') ||
    cat.includes('mart') ||
    cat.includes('store')
  ) {
    return { icon: ShoppingBag, bg: '#f3e8ff', color: '#9333ea' }; // purple
  }
  if (
    cat.includes('movie') ||
    cat.includes('film') ||
    cat.includes('show') ||
    cat.includes('entertainment')
  ) {
    return { icon: Film, bg: '#fce7f3', color: '#db2777' }; // pink
  }
  return { icon: Receipt, bg: '#f1f5f9', color: '#475569' }; // neutral slate
};

// Safe date formatter supporting Firestore Timestamps and Date instances
const formatExpenseDate = (dateVal: any): string => {
  if (!dateVal) return '';
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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
  const [memberEmail, setMemberEmail] = useState('');
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

  const handleAddMember = async () => {
    if (!memberEmail.trim() || !id) return;
    try {
      setAddMemberError(null);
      await addMemberMutation.mutateAsync({
        groupId: id,
        email: memberEmail.trim().toLowerCase(),
      });
      setMemberEmail('');
      setAddMemberOpen(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      setAddMemberError(err.message || 'User not found with this email');
    }
  };

  // Render individual expense card
  const renderExpenseItem = ({ item, index }: { item: Expense; index: number }) => {
    const { icon: CatIcon, bg: catBg, color: catColor } = getCategoryMeta(item.category);
    const isPayer = item.paidBy === currentUser?.id;
    const userSplit = item.splitDetails?.find((s) => s.userId === currentUser?.id);

    return (
      <GlassCard
        key={item.id}
        variant="card"
        borderRadius={20}
        p={14}
        animate
        delay={index * 40}
        style={styles.cardSpacing}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack
              backgroundColor={catBg}
              width={44}
              height={44}
              borderRadius={14}
              alignItems="center"
              justifyContent="center"
            >
              <CatIcon size={20} color={catColor} />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="800" fontSize="$4" numberOfLines={1} color="$color">
                {item.title}
              </Text>
              <Paragraph size="$1" color="$gray10" numberOfLines={1} mt="$0.5">
                Paid by <Text fontWeight="700" color="$color">{memberName(item.paidBy)}</Text> • {formatExpenseDate(item.date)}
              </Paragraph>
              {isPayer ? (
                <Text fontSize="$1" color="#16a34a" fontWeight="700" mt="$0.5">
                  You paid {item.currency} {item.amount.toFixed(2)}
                </Text>
              ) : userSplit ? (
                <Text fontSize="$1" color="#e11d48" fontWeight="700" mt="$0.5">
                  Your share: {item.currency} {userSplit.amount.toFixed(2)}
                </Text>
              ) : null}
            </YStack>
          </XStack>

          <YStack alignItems="flex-end" ml="$2">
            <Text fontWeight="900" fontSize="$4" color="$color">
              {item.currency} {item.amount.toFixed(2)}
            </Text>
            {item.category ? (
              <XStack
                backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                px="$2"
                py="$0.5"
                borderRadius="$3"
                mt="$1.5"
              >
                <Text fontSize={10} fontWeight="700" color="$gray10" textTransform="capitalize">
                  {item.category}
                </Text>
              </XStack>
            ) : null}
          </YStack>
        </XStack>
      </GlassCard>
    );
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Top Header Navigation */}
        <XStack alignItems="center" py="$2.5" justifyContent="space-between">
          <XStack alignItems="center" gap="$3" flex={1}>
            <Pressable
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

        {/* Hero Financial Glass Card */}
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
            <XStack justifyContent="space-between" alignItems="center">
              {/* Total Group Spend */}
              <YStack flex={1}>
                <Paragraph size="$1" color="$gray10" fontWeight="800" textTransform="uppercase" letterSpacing={0.8}>
                  Total Group Spend
                </Paragraph>
                <Text fontWeight="900" fontSize="$7" color="$color" mt="$1" letterSpacing={-0.5}>
                  {selectedCurrency} {totalGroupSpend.toFixed(2)}
                </Text>
              </YStack>

              {/* User Net Balance Badge */}
              <YStack alignItems="flex-end">
                <Paragraph size="$1" color="$gray10" fontWeight="800" textTransform="uppercase" letterSpacing={0.8}>
                  Your Standing
                </Paragraph>
                {userNetBalance > 0.01 ? (
                  <XStack
                    backgroundColor={isDark ? 'rgba(22, 101, 52, 0.3)' : '#dcfce7'}
                    px="$2.5"
                    py="$1.5"
                    borderRadius="$4"
                    alignItems="center"
                    gap="$1.5"
                    mt="$1"
                    borderWidth={1}
                    borderColor={isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}
                  >
                    <ArrowUpRight size={16} color="#15803d" />
                    <Text fontWeight="900" fontSize="$4" color="#15803d">
                      +{selectedCurrency} {userNetBalance.toFixed(2)}
                    </Text>
                  </XStack>
                ) : userNetBalance < -0.01 ? (
                  <XStack
                    backgroundColor={isDark ? 'rgba(159, 18, 57, 0.3)' : '#ffe4e6'}
                    px="$2.5"
                    py="$1.5"
                    borderRadius="$4"
                    alignItems="center"
                    gap="$1.5"
                    mt="$1"
                    borderWidth={1}
                    borderColor={isDark ? 'rgba(244, 63, 94, 0.3)' : '#fecdd3'}
                  >
                    <ArrowDownLeft size={16} color="#be123c" />
                    <Text fontWeight="900" fontSize="$4" color="#be123c">
                      -{selectedCurrency} {Math.abs(userNetBalance).toFixed(2)}
                    </Text>
                  </XStack>
                ) : (
                  <XStack
                    backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : '$gray3'}
                    px="$2.5"
                    py="$1.5"
                    borderRadius="$4"
                    alignItems="center"
                    gap="$1.5"
                    mt="$1"
                  >
                    <CheckCircle2 size={16} color="#16a34a" />
                    <Text fontWeight="800" fontSize="$3" color="$gray11">
                      Settled up
                    </Text>
                  </XStack>
                )}
              </YStack>
            </XStack>
          </GlassCard>
        </MotiView>

        {/* Modern Segmented Tab Switcher */}
        <GlassCard variant="subtle" borderRadius={18} p={4} style={styles.tabSwitcherContainer}>
          <XStack gap="$1">
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('expenses');
              }}
              style={[
                styles.tabButton,
                activeTab === 'expenses' && (isDark ? styles.tabActiveDark : styles.tabActiveLight),
              ]}
            >
              <Receipt size={16} color={activeTab === 'expenses' ? '#0284c7' : '#64748b'} />
              <Text
                fontWeight={activeTab === 'expenses' ? '800' : '600'}
                color={activeTab === 'expenses' ? '$color' : '$gray10'}
                fontSize="$3"
              >
                Expenses ({expenses.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab('balances');
              }}
              style={[
                styles.tabButton,
                activeTab === 'balances' && (isDark ? styles.tabActiveDark : styles.tabActiveLight),
              ]}
            >
              <Scale size={16} color={activeTab === 'balances' ? '#0284c7' : '#64748b'} />
              <Text
                fontWeight={activeTab === 'balances' ? '800' : '600'}
                color={activeTab === 'balances' ? '$color' : '$gray10'}
                fontSize="$3"
              >
                Balances & Settle
              </Text>
            </Pressable>
          </XStack>
        </GlassCard>

        {/* Tab Content */}
        {activeTab === 'expenses' ? (
          <YStack flex={1}>
            <FlashList
              data={expenses}
              renderItem={renderExpenseItem}
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
              <Text fontWeight="800" fontSize="$2" color="$gray10" mb="$2.5" textTransform="uppercase" letterSpacing={0.8}>
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
                    <XStack key={m.userId} justifyContent="space-between" alignItems="center" py="$1">
                      <XStack gap="$2.5" alignItems="center" flex={1}>
                        <YStack
                          width={34}
                          height={34}
                          borderRadius={17}
                          backgroundColor={isUser ? '$blue5' : isDark ? 'rgba(255,255,255,0.08)' : '$gray4'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize={12} fontWeight="800" color={isUser ? '#0284c7' : '$gray11'}>
                            {initials}
                          </Text>
                        </YStack>
                        <YStack flex={1}>
                          <Text fontWeight="700" fontSize="$3" color="$color">
                            {m.displayName} {isUser ? '(You)' : ''}
                          </Text>
                          <Paragraph size="$1" color="$gray10">
                            Paid: {selectedCurrency} {m.totalPaid.toFixed(2)} • Share: {selectedCurrency} {m.totalOwed.toFixed(2)}
                          </Paragraph>
                        </YStack>
                      </XStack>

                      <YStack alignItems="flex-end">
                        {m.netBalance > 0.01 ? (
                          <Text fontWeight="900" fontSize="$3" color="#16a34a">
                            +{selectedCurrency} {m.netBalance.toFixed(2)}
                          </Text>
                        ) : m.netBalance < -0.01 ? (
                          <Text fontWeight="900" fontSize="$3" color="#e11d48">
                            -{selectedCurrency} {Math.abs(m.netBalance).toFixed(2)}
                          </Text>
                        ) : (
                          <Text fontWeight="700" fontSize="$2" color="$gray10">
                            Settled
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  );
                })}
              </YStack>
            </GlassCard>

            {/* Suggested Settlements Section */}
            <Text fontWeight="800" fontSize="$2" color="$gray10" mb="$2" px="$1" textTransform="uppercase" letterSpacing={0.8}>
              Suggested Settlements ({simplifiedDebts.length})
            </Text>

            <FlashList
              data={simplifiedDebts}
              keyExtractor={(_, index) => `debt-${index}`}
              contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
              renderItem={({ item, index }) => {
                const isPayer = item.fromUserId === currentUser?.id;
                const isReceiver = item.toUserId === currentUser?.id;

                return (
                  <GlassCard
                    key={`debt-${index}`}
                    variant="card"
                    borderRadius={20}
                    p={14}
                    animate
                    delay={index * 40}
                    style={styles.cardSpacing}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <XStack gap="$2.5" alignItems="center" flex={1}>
                        <YStack flex={1}>
                          <XStack alignItems="center" gap="$1.5">
                            <Text fontWeight="800" fontSize="$4" color={isPayer ? '#e11d48' : '$color'}>
                              {memberName(item.fromUserId)}
                            </Text>
                            <ArrowRight size={14} color="#64748b" />
                            <Text fontWeight="800" fontSize="$4" color={isReceiver ? '#16a34a' : '$color'}>
                              {memberName(item.toUserId)}
                            </Text>
                          </XStack>
                          {isPayer ? (
                            <Text fontSize="$1" fontWeight="700" color="#e11d48" mt="$0.5">
                              You owe this payment
                            </Text>
                          ) : isReceiver ? (
                            <Text fontSize="$1" fontWeight="700" color="#16a34a" mt="$0.5">
                              Owes you
                            </Text>
                          ) : null}
                        </YStack>
                      </XStack>

                      <YStack alignItems="flex-end" gap="$1">
                        <Text fontWeight="900" fontSize="$5" color="#16a34a">
                          {item.currency} {item.amount.toFixed(2)}
                        </Text>
                        <Button
                          size="$2"
                          borderRadius="$3"
                          backgroundColor="$blue10"
                          color="white"
                          icon={<Wallet size={12} color="white" />}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
                        >
                          <Text color="white" fontWeight="700" fontSize="$1">
                            Settle Up
                          </Text>
                        </Button>
                      </YStack>
                    </XStack>
                  </GlassCard>
                );
              }}
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

        {/* Floating Add Expense Button */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 200 }}
          style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              (router.push as any)({
                pathname: '/expense/add',
                params: { groupId: id || '' },
              });
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

        {/* Add Member Dialog */}
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
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
                Add Group Member
              </Dialog.Title>
              <Dialog.Description size="$2" color="$gray10" mb="$3.5">
                Enter the registered email of the user to add them to {group?.name || 'this group'}.
              </Dialog.Description>

              {addMemberError && (
                <XStack
                  backgroundColor={isDark ? 'rgba(159, 18, 57, 0.25)' : '#fee2e2'}
                  p="$2.5"
                  borderRadius="$3"
                  alignItems="center"
                  gap="$2"
                  mb="$3"
                  borderWidth={1}
                  borderColor={isDark ? 'rgba(244, 63, 94, 0.3)' : '#fca5a5'}
                >
                  <AlertCircle size={16} color="#dc2626" />
                  <Paragraph color="#dc2626" size="$2" flex={1}>
                    {addMemberError}
                  </Paragraph>
                </XStack>
              )}

              <Input
                placeholder="e.g. friend@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={memberEmail}
                onChangeText={setMemberEmail}
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
                  onPress={() => setAddMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="$blue10"
                  color="white"
                  borderRadius="$4"
                  onPress={handleAddMember}
                  disabled={!memberEmail.trim() || addMemberMutation.isPending}
                >
                  <Text color="white" fontWeight="700">
                    {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
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
  navBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroCardMargin: {
    marginBottom: 14,
  },
  cardSpacing: {
    marginBottom: 10,
  },
  emptyCard: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcherContainer: {
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  tabActiveDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
