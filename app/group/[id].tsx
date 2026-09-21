import React, { useState, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H2,
  H3,
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
import { useGroupDetailsQuery, useAddMemberMutation } from '@/queries/useGroups';
import { useGroupExpensesQuery } from '@/queries/useExpenses';
import { useGroupSettlementsQuery } from '@/queries/useSettlements';
import { calculateNetBalances, simplifyDebts } from '@/services/debtSimplifier';
import { useAppStore } from '@/store/useAppStore';
import { Expense, GroupMember } from '@/types';

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
    } catch (err: any) {
      setAddMemberError(err.message || 'User not found with this email');
    }
  };

  // Render individual expense card
  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const { icon: CatIcon, bg: catBg, color: catColor } = getCategoryMeta(item.category);
    const isPayer = item.paidBy === currentUser?.id;
    const userSplit = item.splitDetails?.find((s) => s.userId === currentUser?.id);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <Card
          borderWidth={1}
          borderColor="#e2e8f0"
          backgroundColor="$background"
          mb="$3"
          p="$3.5"
          borderRadius="$5"
          pressStyle={{ scale: 0.985 }}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$3" alignItems="center" flex={1}>
              <YStack
                backgroundColor={catBg}
                width={42}
                height={42}
                borderRadius="$4"
                alignItems="center"
                justifyContent="center"
              >
                <CatIcon size={20} color={catColor} />
              </YStack>
              <YStack flex={1}>
                <Text fontWeight="700" fontSize="$4" numberOfLines={1} color="$color">
                  {item.title}
                </Text>
                <Paragraph size="$1" color="$gray10" numberOfLines={1}>
                  Paid by <Text fontWeight="600">{memberName(item.paidBy)}</Text> • {formatExpenseDate(item.date)}
                </Paragraph>
                {isPayer ? (
                  <Text fontSize="$1" color="$green10" fontWeight="600" mt="$0.5">
                    You paid {item.currency} {item.amount.toFixed(2)}
                  </Text>
                ) : userSplit ? (
                  <Text fontSize="$1" color="$red10" fontWeight="600" mt="$0.5">
                    Your share: {item.currency} {userSplit.amount.toFixed(2)}
                  </Text>
                ) : null}
              </YStack>
            </XStack>

            <YStack alignItems="flex-end">
              <Text fontWeight="800" fontSize="$4" color="$color">
                {item.currency} {item.amount.toFixed(2)}
              </Text>
              {item.category ? (
                <XStack
                  backgroundColor="$gray3"
                  px="$2"
                  py="$0.5"
                  borderRadius="$3"
                  mt="$1"
                >
                  <Text fontSize={10} fontWeight="600" color="$gray10" textTransform="capitalize">
                    {item.category}
                  </Text>
                </XStack>
              ) : null}
            </YStack>
          </XStack>
        </Card>
      </MotiView>
    );
  };

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      {/* Top Header Navigation */}
      <XStack alignItems="center" py="$3" justifyContent="space-between">
        <XStack alignItems="center" gap="$3" flex={1}>
          <Button
            size="$3"
            circular
            chromeless
            icon={<ArrowLeft size={22} />}
            onPress={() => router.back()}
            pressStyle={{ opacity: 0.7 }}
          />
          <YStack flex={1}>
            <H2 fontWeight="900" numberOfLines={1} fontSize="$6" color="$color">
              {group?.name || 'Group Details'}
            </H2>
            <XStack alignItems="center" gap="$1.5">
              <Users size={13} color="#94a3b8" />
              <Paragraph size="$2" color="$gray10">
                {group?.members?.length || 0} {group?.members?.length === 1 ? 'member' : 'members'}
              </Paragraph>
            </XStack>
          </YStack>
        </XStack>

        <Button
          size="$3"
          borderRadius="$4"
          backgroundColor="$blue3"
          icon={<UserPlus size={16} color="#0284c7" />}
          onPress={() => setAddMemberOpen(true)}
          pressStyle={{ opacity: 0.8 }}
        >
          <Text fontWeight="700" color="#0284c7" fontSize="$2">
            + Member
          </Text>
        </Button>
      </XStack>

      {/* Financial Overview Card */}
      <Card
        borderWidth={1}
        borderColor="#e2e8f0"
        p="$4"
        mb="$3.5"
        borderRadius="$5"
        backgroundColor="$background"
        elevation={1}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.04}
        shadowRadius={4}
      >
        <XStack justifyContent="space-between" alignItems="center">
          {/* Total Spend */}
          <YStack flex={1}>
            <Paragraph size="$1" color="$gray10" fontWeight="600" textTransform="uppercase">
              Total Group Spend
            </Paragraph>
            <Text fontWeight="900" fontSize="$6" color="$color" mt="$1">
              {selectedCurrency} {totalGroupSpend.toFixed(2)}
            </Text>
          </YStack>

          {/* User Net Balance Badge */}
          <YStack alignItems="flex-end">
            <Paragraph size="$1" color="$gray10" fontWeight="600" textTransform="uppercase">
              Your Standing
            </Paragraph>
            {userNetBalance > 0.01 ? (
              <XStack
                backgroundColor="#dcfce7"
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
              >
                <ArrowUpRight size={16} color="#15803d" />
                <Text fontWeight="800" fontSize="$4" color="#15803d">
                  +{selectedCurrency} {userNetBalance.toFixed(2)}
                </Text>
              </XStack>
            ) : userNetBalance < -0.01 ? (
              <XStack
                backgroundColor="#ffe4e6"
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
              >
                <ArrowDownLeft size={16} color="#be123c" />
                <Text fontWeight="800" fontSize="$4" color="#be123c">
                  -{selectedCurrency} {Math.abs(userNetBalance).toFixed(2)}
                </Text>
              </XStack>
            ) : (
              <XStack
                backgroundColor="$gray3"
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
              >
                <CheckCircle2 size={16} color="#16a34a" />
                <Text fontWeight="700" fontSize="$3" color="$gray11">
                  Settled up
                </Text>
              </XStack>
            )}
          </YStack>
        </XStack>
      </Card>

      {/* Modern Segmented Tab Switcher */}
      <XStack
        backgroundColor="#f1f5f9"
        p="$1"
        borderRadius="$5"
        mb="$3.5"
        borderWidth={1}
        borderColor="#e2e8f0"
      >
        <Button
          flex={1}
          size="$3"
          backgroundColor={activeTab === 'expenses' ? '$background' : 'transparent'}
          borderRadius="$4"
          borderWidth={activeTab === 'expenses' ? 1 : 0}
          borderColor={activeTab === 'expenses' ? '#e2e8f0' : 'transparent'}
          elevation={activeTab === 'expenses' ? 2 : 0}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.06}
          shadowRadius={2}
          onPress={() => setActiveTab('expenses')}
          pressStyle={{ opacity: 0.8 }}
          icon={<Receipt size={16} color={activeTab === 'expenses' ? '#0284c7' : '#64748b'} />}
        >
          <Text
            fontWeight={activeTab === 'expenses' ? '700' : '500'}
            color={activeTab === 'expenses' ? '$color' : '$gray10'}
            fontSize="$3"
          >
            Expenses ({expenses.length})
          </Text>
        </Button>

        <Button
          flex={1}
          size="$3"
          backgroundColor={activeTab === 'balances' ? '$background' : 'transparent'}
          borderRadius="$4"
          borderWidth={activeTab === 'balances' ? 1 : 0}
          borderColor={activeTab === 'balances' ? '#e2e8f0' : 'transparent'}
          elevation={activeTab === 'balances' ? 2 : 0}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.06}
          shadowRadius={2}
          onPress={() => setActiveTab('balances')}
          pressStyle={{ opacity: 0.8 }}
          icon={<Scale size={16} color={activeTab === 'balances' ? '#0284c7' : '#64748b'} />}
        >
          <Text
            fontWeight={activeTab === 'balances' ? '700' : '500'}
            color={activeTab === 'balances' ? '$color' : '$gray10'}
            fontSize="$3"
          >
            Balances & Settle
          </Text>
        </Button>
      </XStack>

      {/* Tab Content */}
      {activeTab === 'expenses' ? (
        <YStack flex={1}>
          <FlashList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
            refreshControl={<RefreshControl refreshing={expLoading} onRefresh={refetch} />}
            ListEmptyComponent={
              <YStack alignItems="center" justifyContent="center" py="$8">
                <YStack
                  backgroundColor="$blue2"
                  p="$4"
                  borderRadius="$6"
                  alignItems="center"
                  justifyContent="center"
                >
                  <DollarSign size={40} color="#0284c7" />
                </YStack>
                <Text mt="$3" fontWeight="700" fontSize="$5" color="$color">
                  No expenses yet
                </Text>
                <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1" px="$4">
                  Add groceries, dinners, cab rides, or tickets to start splitting automatically.
                </Paragraph>
                <Button
                  mt="$4"
                  theme="active"
                  size="$3"
                  icon={<Plus size={16} />}
                  onPress={() =>
                    (router.push as any)({
                      pathname: '/expense/add',
                      params: { groupId: id || '' },
                    })
                  }
                >
                  Add First Expense
                </Button>
              </YStack>
            }
          />
        </YStack>
      ) : (
        <YStack flex={1}>
          {/* Debt Simplification Header Card */}
          <Card
            borderWidth={1}
            borderColor="#e2e8f0"
            p="$3.5"
            mb="$3"
            backgroundColor="$blue2"
            borderRadius="$5"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2.5" alignItems="center" flex={1}>
                <YStack backgroundColor="$blue5" p="$2" borderRadius="$3">
                  <Sparkles size={18} color="#0284c7" />
                </YStack>
                <YStack flex={1}>
                  <Text fontWeight="700" fontSize="$3" color="$color">
                    Smart Debt Simplification
                  </Text>
                  <Paragraph size="$1" color="$gray10">
                    Minimizes transfers using min-cash-flow algorithm
                  </Paragraph>
                </YStack>
              </XStack>
              <Switch checked={useSimplifiedDebts} onCheckedChange={setUseSimplifiedDebts}>
                <Switch.Thumb />
              </Switch>
            </XStack>
          </Card>

          {/* Member Net Balances Breakdown */}
          <Card
            borderWidth={1}
            borderColor="#e2e8f0"
            p="$3.5"
            mb="$3"
            borderRadius="$5"
            backgroundColor="$background"
          >
            <Text fontWeight="700" fontSize="$3" color="$gray10" mb="$2.5" textTransform="uppercase">
              Member Net Positions
            </Text>
            <YStack gap="$2">
              {memberBalancesList.map((m) => {
                const isUser = m.userId === currentUser?.id;
                const initials = m.displayName
                  ? m.displayName
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '??';

                return (
                  <XStack key={m.userId} justifyContent="space-between" alignItems="center" py="$1">
                    <XStack gap="$2.5" alignItems="center" flex={1}>
                      <YStack
                        width={32}
                        height={32}
                        borderRadius={16}
                        backgroundColor={isUser ? '$blue5' : '$gray4'}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={12} fontWeight="700" color={isUser ? '#0284c7' : '$gray11'}>
                          {initials}
                        </Text>
                      </YStack>
                      <YStack flex={1}>
                        <Text fontWeight="600" fontSize="$3" color="$color">
                          {m.displayName} {isUser ? '(You)' : ''}
                        </Text>
                        <Paragraph size="$1" color="$gray10">
                          Paid: {selectedCurrency} {m.totalPaid.toFixed(2)} • Share: {selectedCurrency} {m.totalOwed.toFixed(2)}
                        </Paragraph>
                      </YStack>
                    </XStack>

                    <YStack alignItems="flex-end">
                      {m.netBalance > 0.01 ? (
                        <Text fontWeight="800" fontSize="$3" color="#16a34a">
                          +{selectedCurrency} {m.netBalance.toFixed(2)}
                        </Text>
                      ) : m.netBalance < -0.01 ? (
                        <Text fontWeight="800" fontSize="$3" color="#dc2626">
                          -{selectedCurrency} {Math.abs(m.netBalance).toFixed(2)}
                        </Text>
                      ) : (
                        <Text fontWeight="600" fontSize="$2" color="$gray10">
                          Settled
                        </Text>
                      )}
                    </YStack>
                  </XStack>
                );
              })}
            </YStack>
          </Card>

          {/* Suggested Settlements Section */}
          <Text fontWeight="700" fontSize="$3" color="$gray10" mb="$2" textTransform="uppercase">
            Suggested Settlements ({simplifiedDebts.length})
          </Text>

          <FlashList
            data={simplifiedDebts}
            keyExtractor={(_, index) => `debt-${index}`}
            contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
            renderItem={({ item }) => {
              const isPayer = item.fromUserId === currentUser?.id;
              const isReceiver = item.toUserId === currentUser?.id;

              return (
                <Card
                  borderWidth={1}
                  borderColor="#e2e8f0"
                  p="$3.5"
                  mb="$2.5"
                  borderRadius="$5"
                  backgroundColor="$background"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$2" alignItems="center" flex={1}>
                      <YStack flex={1}>
                        <XStack alignItems="center" gap="$1.5">
                          <Text fontWeight="700" fontSize="$4" color={isPayer ? '#dc2626' : '$color'}>
                            {memberName(item.fromUserId)}
                          </Text>
                          <ArrowRight size={14} color="#64748b" />
                          <Text fontWeight="700" fontSize="$4" color={isReceiver ? '#16a34a' : '$color'}>
                            {memberName(item.toUserId)}
                          </Text>
                        </XStack>
                        {isPayer ? (
                          <Text fontSize="$1" fontWeight="600" color="#dc2626" mt="$0.5">
                            You need to pay
                          </Text>
                        ) : isReceiver ? (
                          <Text fontSize="$1" fontWeight="600" color="#16a34a" mt="$0.5">
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
                        theme="active"
                        borderRadius="$3"
                        icon={<Wallet size={12} />}
                        onPress={() =>
                          (router.push as any)({
                            pathname: '/settle/[id]',
                            params: {
                              id: id || '',
                              from: item.fromUserId,
                              to: item.toUserId,
                              amount: String(item.amount),
                            },
                          })
                        }
                      >
                        Settle Up
                      </Button>
                    </YStack>
                  </XStack>
                </Card>
              );
            }}
            ListEmptyComponent={
              <YStack alignItems="center" justifyContent="center" py="$8">
                <YStack
                  backgroundColor="#dcfce7"
                  p="$4"
                  borderRadius="$6"
                  alignItems="center"
                  justifyContent="center"
                >
                  <CheckCircle2 size={40} color="#16a34a" />
                </YStack>
                <Text mt="$3" fontWeight="800" fontSize="$5" color="#16a34a">
                  All Settled Up!
                </Text>
                <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1">
                  Nobody in this group owes any money right now.
                </Paragraph>
              </YStack>
            }
          />
        </YStack>
      )}

      {/* Floating Add Expense Button */}
      <Button
        position="absolute"
        bottom={insets.bottom + 20}
        right={20}
        size="$5"
        circular
        theme="active"
        elevation={6}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.2}
        shadowRadius={6}
        icon={<Plus size={24} />}
        onPress={() =>
          (router.push as any)({
            pathname: '/expense/add',
            params: { groupId: id || '' },
          })
        }
      />

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <Dialog.Portal>
          <Dialog.Overlay key="overlay" opacity={0.5} />
          <Dialog.Content
            key="content"
            p="$4"
            width="90%"
            borderWidth={1}
            borderColor="#e2e8f0"
            borderRadius="$5"
          >
            <Dialog.Title>Add Group Member</Dialog.Title>
            <Dialog.Description size="$2" color="$gray10" mb="$3">
              Enter the registered email of the user to add them to {group?.name || 'this group'}.
            </Dialog.Description>

            {addMemberError && (
              <XStack
                backgroundColor="#fee2e2"
                p="$2.5"
                borderRadius="$3"
                alignItems="center"
                gap="$2"
                mb="$3"
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
            />

            <XStack justifyContent="flex-end" gap="$2">
              <Button chromeless onPress={() => setAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button
                theme="active"
                onPress={handleAddMember}
                disabled={!memberEmail.trim() || addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  );
}
