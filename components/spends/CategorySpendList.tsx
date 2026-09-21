import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';
import { CATEGORIES } from '@/components/ui/CategoryBadge';
import { formatCurrency } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

export interface CategorySpendItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface CategorySpendListProps {
  items: CategorySpendItem[];
  currency?: string;
  totalSpent: number;
}

export const CategorySpendList: React.FC<CategorySpendListProps> = ({
  items,
  currency = 'INR',
  totalSpent,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  if (!items || items.length === 0) {
    return (
      <GlassCard variant="subtle" p={16} borderRadius={20}>
        <Text textAlign="center" color="$gray10" fontSize="$2" fontWeight="600">
          No expenses recorded this month yet.
        </Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" borderRadius={24} p={18}>
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$4" fontWeight="800" color="$color">
            Category Breakdown
          </Text>
          <Text fontSize="$2" fontWeight="700" color="$gray10">
            {items.length} categories
          </Text>
        </XStack>

        <YStack gap="$2.5">
          {items.map((item) => {
            const meta = CATEGORIES.find(
              (c) => c.id.toLowerCase() === item.category.toLowerCase()
            ) || {
              id: item.category,
              label: item.category,
              icon: CATEGORIES[0].icon,
              lightColor: '#64748b',
              darkColor: '#94a3b8',
              lightBg: 'rgba(100, 116, 139, 0.12)',
              darkBg: 'rgba(148, 163, 184, 0.20)',
            };

            const CatIcon = meta.icon;
            const color = isDark ? meta.darkColor : meta.lightColor;
            const bg = isDark ? meta.darkBg : meta.lightBg;
            const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;

            return (
              <YStack key={item.category} gap="$1.5">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" gap="$2">
                    <YStack
                      width={30}
                      height={30}
                      borderRadius={10}
                      backgroundColor={bg}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CatIcon size={14} color={color} />
                    </YStack>
                    <Text fontSize="$3" fontWeight="700" color="$color" textTransform="capitalize">
                      {meta.label}
                    </Text>
                  </XStack>

                  <XStack alignItems="center" gap="$2">
                    <Text fontSize="$3" fontWeight="800" color="$color">
                      {formatCurrency(item.amount, currency)}
                    </Text>
                    <Text fontSize={11} fontWeight="700" color="$gray10" minWidth={32} textAlign="right">
                      {pct}%
                    </Text>
                  </XStack>
                </XStack>

                {/* Progress bar */}
                <YStack
                  height={6}
                  borderRadius={3}
                  backgroundColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}
                  overflow="hidden"
                >
                  <YStack
                    height="100%"
                    width={`${pct}%`}
                    backgroundColor={color}
                    borderRadius={3}
                  />
                </YStack>
              </YStack>
            );
          })}
        </YStack>
      </YStack>
    </GlassCard>
  );
};
