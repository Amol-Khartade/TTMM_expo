import React, { useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, Text, Button, Tabs, SizableText } from 'tamagui';
import { Wallet, Receipt, PiggyBank, Plus } from '@tamagui/lucide-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFinanceStore } from '@/store/useFinanceStore';
import { BudgetGaugeCard } from '@/components/spends/BudgetGaugeCard';
import { CategorySpendList } from '@/components/spends/CategorySpendList';
import { BillItemCard } from '@/components/spends/BillItemCard';
import { AddBillModal } from '@/components/spends/AddBillModal';
import { SavingsGoalCard } from '@/components/spends/SavingsGoalCard';
import { AddSavingsGoalModal } from '@/components/spends/AddSavingsGoalModal';
import { DepositModal } from '@/components/spends/DepositModal';
import { SavingsGoal, Expense } from '@/types';

export default function SpendsScreen() {
  const [activeTab, setActiveTab] = useState('budget');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals state
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  const { 
    bills, 
    savingsGoals, 
    monthlyBudget,
    markBillPaid,
    resetBillStatus,
    deleteBill
  } = useFinanceStore();
  
  // TODO: Fetch all user expenses across groups
  const expenses: Expense[] = []; 

  // Calculate total spent this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categorySpendMap = thisMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryItems = Object.entries(categorySpendMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        <XStack paddingHorizontal="$4" paddingTop="$2" paddingBottom="$4" justifyContent="space-between" alignItems="center">
          <Text fontSize="$8" fontWeight="bold" color="$text">
            Finance
          </Text>
          {activeTab === 'bills' && (
            <Button size="$3" circular icon={Plus} theme="active" onPress={() => setIsAddBillOpen(true)} />
          )}
          {activeTab === 'savings' && (
            <Button size="$3" circular icon={Plus} theme="active" onPress={() => setIsAddGoalOpen(true)} />
          )}
        </XStack>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="horizontal"
          flexDirection="column"
          flex={1}
        >
          <Tabs.List
            marginHorizontal="$4"
            marginBottom="$4"
            backgroundColor="$gray3"
            borderRadius="$4"
            padding="$1"
          >
            <Tabs.Tab flex={1} value="budget" paddingVertical="$2" borderRadius="$3">
              <XStack gap="$2" alignItems="center">
                <Wallet size={16} color={activeTab === 'budget' ? '$text' : '$gray10'} />
                <SizableText color={activeTab === 'budget' ? '$text' : '$gray10'} fontWeight={activeTab === 'budget' ? 'bold' : 'normal'}>
                  Budget
                </SizableText>
              </XStack>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="bills" paddingVertical="$2" borderRadius="$3">
              <XStack gap="$2" alignItems="center">
                <Receipt size={16} color={activeTab === 'bills' ? '$text' : '$gray10'} />
                <SizableText color={activeTab === 'bills' ? '$text' : '$gray10'} fontWeight={activeTab === 'bills' ? 'bold' : 'normal'}>
                  Bills
                </SizableText>
              </XStack>
            </Tabs.Tab>
            <Tabs.Tab flex={1} value="savings" paddingVertical="$2" borderRadius="$3">
              <XStack gap="$2" alignItems="center">
                <PiggyBank size={16} color={activeTab === 'savings' ? '$text' : '$gray10'} />
                <SizableText color={activeTab === 'savings' ? '$text' : '$gray10'} fontWeight={activeTab === 'savings' ? 'bold' : 'normal'}>
                  Savings
                </SizableText>
              </XStack>
            </Tabs.Tab>
          </Tabs.List>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {/* BUDGET TAB */}
            <Tabs.Content value="budget" paddingHorizontal="$4">
              <YStack gap="$4" paddingBottom="$8">
                <BudgetGaugeCard 
                  spent={totalSpent} 
                  budget={monthlyBudget} 
                />
                <Text fontSize="$5" fontWeight="600" marginTop="$2">
                  Category Breakdown
                </Text>
                <CategorySpendList 
                  items={categoryItems.length > 0 ? categoryItems : [
                    { category: 'food', amount: 0, percentage: 0 },
                    { category: 'transport', amount: 0, percentage: 0 }
                  ]} 
                  totalSpent={totalSpent} 
                />
              </YStack>
            </Tabs.Content>

            {/* BILLS TAB */}
            <Tabs.Content value="bills" paddingHorizontal="$4">
              <YStack gap="$4" paddingBottom="$8">
                {bills.length === 0 ? (
                  <YStack alignItems="center" padding="$6" gap="$3">
                    <Receipt size={48} color="$gray8" />
                    <Text fontSize="$5" fontWeight="600" color="$gray11">No upcoming bills</Text>
                    <Text fontSize="$3" color="$gray10" textAlign="center">
                      Add your recurring bills and subscriptions here.
                    </Text>
                    <Button marginTop="$2" theme="active" icon={Plus} onPress={() => setIsAddBillOpen(true)}>
                      Add Bill
                    </Button>
                  </YStack>
                ) : (
                  bills
                    .sort((a, b) => a.dueDay - b.dueDay)
                    .map((bill) => (
                      <BillItemCard
                        key={bill.id}
                        bill={bill}
                        onMarkPaid={() => markBillPaid(bill.id)}
                        onResetStatus={() => resetBillStatus(bill.id)}
                        onDelete={() => deleteBill(bill.id)}
                      />
                    ))
                )}
              </YStack>
            </Tabs.Content>

            {/* SAVINGS TAB */}
            <Tabs.Content value="savings" paddingHorizontal="$4">
              <YStack gap="$4" paddingBottom="$8">
                {savingsGoals.length === 0 ? (
                  <YStack alignItems="center" padding="$6" gap="$3">
                    <PiggyBank size={48} color="$gray8" />
                    <Text fontSize="$5" fontWeight="600" color="$gray11">No savings goals</Text>
                    <Text fontSize="$3" color="$gray10" textAlign="center">
                      Create goals for trips, emergency funds, or big purchases.
                    </Text>
                    <Button marginTop="$2" theme="active" icon={Plus} onPress={() => setIsAddGoalOpen(true)}>
                      Create Goal
                    </Button>
                  </YStack>
                ) : (
                  savingsGoals.map((goal) => (
                    <SavingsGoalCard
                      key={goal.id}
                      goal={goal}
                      onDepositPress={(g) => setSelectedGoalForDeposit(g)}
                    />
                  ))
                )}
              </YStack>
            </Tabs.Content>
          </ScrollView>
        </Tabs>
      </YStack>

      <AddBillModal open={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} />
      <AddSavingsGoalModal open={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
      <DepositModal 
        open={!!selectedGoalForDeposit} 
        onClose={() => setSelectedGoalForDeposit(null)} 
        goal={selectedGoalForDeposit} 
      />
    </SafeAreaView>
  );
}
