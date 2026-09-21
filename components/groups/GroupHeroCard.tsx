import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { MotiView } from 'moti';
import { GlassCard } from '@/components/ui/GlassCard';
import { BalanceStatusBadge } from '@/components/ui/BalanceStatusBadge';
import { formatCurrency } from '@/utils/formatters';

export interface GroupHeroCardProps {
  totalGroupSpend: number;
  userNetBalance: number;
  currency: string;
  style?: ViewStyle;
}

export const GroupHeroCard: React.FC<GroupHeroCardProps> = ({
  totalGroupSpend,
  userNetBalance,
  currency,
  style,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -8, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 220 }}
    >
      <GlassCard
        variant="elevated"
        borderRadius={24}
        p={18}
        style={[styles.card, style]}
      >
        <XStack justifyContent="space-between" alignItems="center">
          {/* Total Group Spend */}
          <YStack flex={1}>
            <Paragraph
              size="$1"
              color="$gray10"
              fontWeight="800"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Total Group Spend
            </Paragraph>
            <Text fontWeight="900" fontSize="$7" color="$color" mt="$1" letterSpacing={-0.5}>
              {formatCurrency(totalGroupSpend, currency)}
            </Text>
          </YStack>

          {/* User Net Balance Badge (DRY Component) */}
          <YStack alignItems="flex-end">
            <Paragraph
              size="$1"
              color="$gray10"
              fontWeight="800"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Your Standing
            </Paragraph>
            <BalanceStatusBadge
              balance={userNetBalance}
              currency={currency}
              variant="badge"
            />
          </YStack>
        </XStack>
      </GlassCard>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
});
