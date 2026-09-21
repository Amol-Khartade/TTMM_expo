import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sliders,
} from '@tamagui/lucide-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

export interface BudgetGaugeCardProps {
  spent: number;
  budget: number;
  currency?: string;
  onAdjustBudget?: () => void;
}

export const BudgetGaugeCard: React.FC<BudgetGaugeCardProps> = ({
  spent,
  budget,
  currency = 'INR',
  onAdjustBudget,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const rawPct = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = Math.max(0, budget - spent);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());
  const dailyAverage = Math.round(spent / Math.max(1, now.getDate()));
  const dailyAllowance = Math.round(remaining / daysLeft);

  const isOver = spent > budget;
  const isWarning = rawPct >= 80 && !isOver;

  const statusColor = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
  const statusBg = isOver
    ? 'rgba(239, 68, 68, 0.12)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(16, 185, 129, 0.12)';
  const statusBorder = isOver
    ? 'rgba(239, 68, 68, 0.28)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.28)'
    : 'rgba(16, 185, 129, 0.28)';
  const statusText = isOver
    ? 'Over Budget'
    : isWarning
    ? 'Near Budget Limit'
    : 'Spending On Track';

  return (
    <GlassCard variant="elevated" borderRadius={24} p={18}>
      <YStack gap="$3">
        {/* Top Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2">
            <YStack
              width={36}
              height={36}
              borderRadius={12}
              backgroundColor={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.10)'}
              alignItems="center"
              justifyContent="center"
            >
              <Wallet size={18} color={isDark ? '#38bdf8' : '#0284c7'} />
            </YStack>
            <YStack>
              <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                Monthly Spends
              </Text>
              <Text fontSize="$5" fontWeight="900" color="$color">
                {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
            </YStack>
          </XStack>

          {onAdjustBudget && (
            <Pressable
              onPress={onAdjustBudget}
              style={({ pressed }) => [
                styles.adjustBtn,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(0, 0, 0, 0.08)',
                },
                pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
              ]}
              accessibilityLabel="Adjust monthly budget"
            >
              <Sliders size={14} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text fontSize={11} fontWeight="700" color="$gray11">
                Edit
              </Text>
            </Pressable>
          )}
        </XStack>

        {/* Spend & Budget Numbers */}
        <XStack justifyContent="space-between" alignItems="flex-end" mt="$1">
          <YStack>
            <Text fontSize="$1" color="$gray10" fontWeight="700" textTransform="uppercase">
              Total Spent
            </Text>
            <Text fontSize="$8" fontWeight="900" color={statusColor}>
              {formatCurrency(spent, currency)}
            </Text>
          </YStack>

          <YStack alignItems="flex-end">
            <XStack
              backgroundColor={statusBg}
              borderColor={statusBorder}
              borderWidth={1}
              px="$2"
              py="$0.5"
              borderRadius="$3"
              alignItems="center"
              gap="$1"
              mb="$1"
            >
              {isOver ? (
                <AlertTriangle size={12} color={statusColor} />
              ) : isWarning ? (
                <AlertTriangle size={12} color={statusColor} />
              ) : (
                <CheckCircle2 size={12} color={statusColor} />
              )}
              <Text fontSize={10} fontWeight="800" color={statusColor}>
                {statusText}
              </Text>
            </XStack>
            <Text fontSize="$2" color="$gray10" fontWeight="600">
              Budget: {formatCurrency(budget, currency)}
            </Text>
          </YStack>
        </XStack>

        {/* Progress Bar */}
        <YStack gap="$1.5">
          <YStack
            height={10}
            borderRadius={5}
            backgroundColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
            overflow="hidden"
          >
            <YStack
              height="100%"
              width={`${pct}%`}
              backgroundColor={statusColor}
              borderRadius={5}
            />
          </YStack>

          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={11} color="$gray10" fontWeight="600">
              {pct}% used
            </Text>
            <Text fontSize={11} color="$gray10" fontWeight="700">
              {formatCurrency(remaining, currency)} remaining
            </Text>
          </XStack>
        </YStack>

        <Separator opacity={0.12} />

        {/* Footer Metrics: Days left & Daily Allowance */}
        <XStack justifyContent="space-around" alignItems="center" pt="$0.5">
          <YStack alignItems="center" gap="$0.5">
            <XStack alignItems="center" gap="$1">
              <Calendar size={12} color="$gray10" />
              <Text fontSize={11} color="$gray10" fontWeight="600">
                Days Left
              </Text>
            </XStack>
            <Text fontSize="$4" fontWeight="800" color="$color">
              {daysLeft}
            </Text>
          </YStack>

          <YStack width={1} height={24} backgroundColor="$gray8" opacity={0.3} />

          <YStack alignItems="center" gap="$0.5">
            <XStack alignItems="center" gap="$1">
              <TrendingUp size={12} color="$gray10" />
              <Text fontSize={11} color="$gray10" fontWeight="600">
                Daily Avg Spend
              </Text>
            </XStack>
            <Text fontSize="$4" fontWeight="800" color="$color">
              {formatCurrency(dailyAverage, currency)}
            </Text>
          </YStack>

          <YStack width={1} height={24} backgroundColor="$gray8" opacity={0.3} />

          <YStack alignItems="center" gap="$0.5">
            <Text fontSize={11} color="$gray10" fontWeight="600">
              Daily Target
            </Text>
            <Text fontSize="$4" fontWeight="800" color="#10b981">
              {formatCurrency(dailyAllowance, currency)}
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
});
