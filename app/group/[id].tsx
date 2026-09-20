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
  ArrowRight,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroupDetailsQuery } from '@/queries/useGroups';
import { useGroupExpensesQuery } from '@/queries/useExpenses';
import { useGroupSettlementsQuery } from '@/queries/useSettlements';
import { calculateNetBalances, simplifyDebts } from '@/services/debtSimplifier';
import { useAppStore } from '@/store/useAppStore';
import { Expense } from '@/types';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const currentUser = useAppStore((state) => state.currentUser);

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [useSimplifiedDebts, setUseSimplifiedDebts] = useState(true);

  const { data: group } = useGroupDetailsQuery(id);
  const { data: expenses = [], isLoading: expLoading, refetch } = useGroupExpensesQuery(id);
  const { data: settlements = [] } = useGroupSettlementsQuery(id);

  // Compute Balances and Simplified Debts
  const { simplifiedDebts } = useMemo(() => {
    const bMap = calculateNetBalances(expenses, settlements, selectedCurrency);
    const debts = simplifyDebts(bMap, selectedCurrency);
    return { balancesMap: bMap, simplifiedDebts: debts };
  }, [expenses, settlements, selectedCurrency]);

  const memberName = (userId: string) => {
    const member = group?.members.find((m) => m.userId === userId);
    return member?.displayName || (userId === currentUser?.id ? 'You' : 'Member');
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <MotiView
      from={{ opacity: 0, translateY: 5 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 200 }}
    >
      <Card borderWidth={1} borderColor="#e2e8f0" mb="$3" p="$3.5" borderRadius="$5">
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack backgroundColor="$blue3" p="$2.5" borderRadius="$4">
              <DollarSign size={20} color="#0284c7" />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="700" fontSize="$4" numberOfLines={1}>
                {item.title}
              </Text>
              <Paragraph size="$1" color="$gray10">
                Paid by {memberName(item.paidBy)} • {new Date(item.date).toLocaleDateString()}
              </Paragraph>
            </YStack>
          </XStack>
          <Text fontWeight="800" fontSize="$5" color="$color">
            {item.currency} {item.amount.toFixed(2)}
          </Text>
        </XStack>
      </Card>
    </MotiView>
  );

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      {/* Top Navigation */}
      <XStack alignItems="center" py="$3" gap="$3">
        <Button
          size="$3"
          circular
          chromeless
          icon={<ArrowLeft size={22} />}
          onPress={() => router.back()}
        />
        <YStack flex={1}>
          <H2 fontWeight="900" numberOfLines={1} fontSize="$6">
            {group?.name || 'Group Details'}
          </H2>
          <Paragraph size="$2" color="$gray10">
            {group?.members.length || 0} members
          </Paragraph>
        </YStack>
      </XStack>

      {/* Tab Switcher */}
      <XStack backgroundColor="$gray3" p="$1" borderRadius="$6" mb="$4">
        <Button
          flex={1}
          size="$3"
          theme={activeTab === 'expenses' ? 'active' : undefined}
          chromeless={activeTab !== 'expenses'}
          onPress={() => setActiveTab('expenses')}
          borderRadius="$5"
        >
          Expenses ({expenses.length})
        </Button>
        <Button
          flex={1}
          size="$3"
          theme={activeTab === 'balances' ? 'active' : undefined}
          chromeless={activeTab !== 'balances'}
          onPress={() => setActiveTab('balances')}
          borderRadius="$5"
        >
          Balances & Settle
        </Button>
      </XStack>

      {activeTab === 'expenses' ? (
        <YStack flex={1}>
          <FlashList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={expLoading} onRefresh={refetch} />}
            ListEmptyComponent={
              <YStack alignItems="center" justifyContent="center" py="$8">
                <DollarSign size={40} color="#94a3b8" />
                <Text mt="$2" fontWeight="700">
                  No expenses added yet
                </Text>
                <Paragraph size="$2" color="$gray10">
                  Tap + below to add an expense to this group.
                </Paragraph>
              </YStack>
            }
          />
        </YStack>
      ) : (
        <YStack flex={1}>
          {/* Debt Simplification Header */}
          <Card borderWidth={1} borderColor="#e2e8f0" p="$3" mb="$4" backgroundColor="$blue2" borderRadius="$5">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2" alignItems="center" flex={1}>
                <Sparkles size={18} color="#0284c7" />
                <YStack>
                  <Text fontWeight="700" fontSize="$3">
                    Simplify Debts (Min-Cash-Flow)
                  </Text>
                  <Paragraph size="$1" color="$gray10">
                    Minimizes the total number of transactions
                  </Paragraph>
                </YStack>
              </XStack>
              <Switch checked={useSimplifiedDebts} onCheckedChange={setUseSimplifiedDebts}>
                <Switch.Thumb />
              </Switch>
            </XStack>
          </Card>

          {/* Settle Up Cards */}
          <Text fontWeight="700" fontSize="$3" color="$gray10" mb="$2" textTransform="uppercase">
            Suggested Settlements
          </Text>

          <FlashList
            data={simplifiedDebts}
            keyExtractor={(_, index) => `debt-${index}`}
            renderItem={({ item }) => (
              <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$3" borderRadius="$5">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center" flex={1}>
                    <Text fontWeight="700" fontSize="$4">
                      {memberName(item.fromUserId)}
                    </Text>
                    <ArrowRight size={16} color="#64748b" />
                    <Text fontWeight="700" fontSize="$4">
                      {memberName(item.toUserId)}
                    </Text>
                  </XStack>
                  <YStack alignItems="flex-end">
                    <Text fontWeight="900" fontSize="$5" color="$green10">
                      {item.currency} {item.amount.toFixed(2)}
                    </Text>
                    <Button
                      size="$2"
                      theme="active"
                      mt="$1"
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
            )}
            ListEmptyComponent={
              <YStack alignItems="center" justifyContent="center" py="$8">
                <CheckCircle2 size={40} color="#16a34a" />
                <Text mt="$2" fontWeight="700" fontSize="$5" color="$green10">
                  All Settled Up!
                </Text>
                <Paragraph size="$2" color="$gray10">
                  Nobody in this group owes anything right now.
                </Paragraph>
              </YStack>
            }
          />
        </YStack>
      )}

      {/* Floating Add Expense */}
      <Button
        position="absolute"
        bottom={insets.bottom + 16}
        right={16}
        size="$5"
        circular
        theme="active"
        icon={<Plus size={24} />}
        onPress={() =>
          (router.push as any)({
            pathname: '/expense/add',
            params: { groupId: id || '' },
          })
        }
      />
    </YStack>
  );
}
