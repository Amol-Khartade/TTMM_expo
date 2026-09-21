import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { Expense } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useAppStore } from '@/store/useAppStore';

// Safe date formatter supporting Firestore Timestamps and Date instances
const formatExpenseDate = (dateVal: any): string => {
  if (!dateVal) return '';
  const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
  payerName: string;
  index?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  currentUserId,
  payerName,
  index = 0,
  onPress,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const isPayer = expense.paidBy === currentUserId;
  const userSplit = expense.splitDetails?.find((s) => s.userId === currentUserId);

  return (
    <GlassCard
      variant="card"
      borderRadius={20}
      p={14}
      animate
      delay={index * 40}
      style={[styles.card, style]}
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3" alignItems="center" flex={1}>
          <CategoryBadge category={expense.category} size="md" />

          <YStack flex={1}>
            <Text fontWeight="800" fontSize="$4" numberOfLines={1} color="$color">
              {expense.title}
            </Text>
            <Paragraph size="$1" color="$gray10" numberOfLines={1} mt="$0.5">
              Paid by <Text fontWeight="700" color="$color">{payerName}</Text> • {formatExpenseDate(expense.date)}
            </Paragraph>
            {isPayer ? (
              <Text fontSize="$1" color={isDark ? '#4ade80' : '#16a34a'} fontWeight="700" mt="$0.5">
                You paid {expense.currency} {expense.amount.toFixed(2)}
              </Text>
            ) : userSplit ? (
              <Text fontSize="$1" color={isDark ? '#fb7185' : '#e11d48'} fontWeight="700" mt="$0.5">
                Your share: {expense.currency} {userSplit.amount.toFixed(2)}
              </Text>
            ) : null}
          </YStack>
        </XStack>

        <YStack alignItems="flex-end" ml="$2">
          <Text fontWeight="900" fontSize="$4" color="$color">
            {expense.currency} {expense.amount.toFixed(2)}
          </Text>
          {expense.category ? (
            <XStack
              backgroundColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
              px="$2"
              py="$0.5"
              borderRadius="$3"
              borderWidth={1}
              borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)'}
              mt="$1.5"
            >
              <Text fontSize={10} fontWeight="700" color="$gray10" textTransform="capitalize">
                {expense.category}
              </Text>
            </XStack>
          ) : null}
        </YStack>
      </XStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
});
