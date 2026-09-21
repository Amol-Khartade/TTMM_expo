import React from 'react';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { BalanceStatusBadge } from '@/components/ui/BalanceStatusBadge';
import { formatCurrency } from '@/utils/formatters';

export interface MemberNetPositionRowProps {
  displayName: string;
  initials?: string;
  isCurrentUser?: boolean;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
  currency: string;
}

export const MemberNetPositionRow: React.FC<MemberNetPositionRowProps> = ({
  displayName,
  isCurrentUser = false,
  totalPaid,
  totalOwed,
  netBalance,
  currency,
}) => {
  return (
    <XStack justifyContent="space-between" alignItems="center" py="$1">
      <XStack gap="$2.5" alignItems="center" flex={1}>
        <UserAvatar name={displayName} size="sm" isCurrentUser={isCurrentUser} />

        <YStack flex={1}>
          <Text fontWeight="700" fontSize="$3" color="$color">
            {displayName} {isCurrentUser ? '(You)' : ''}
          </Text>
          <Paragraph size="$1" color="$gray10">
            Paid: {formatCurrency(totalPaid, currency)} • Share: {formatCurrency(totalOwed, currency)}
          </Paragraph>
        </YStack>
      </XStack>

      <YStack alignItems="flex-end">
        <BalanceStatusBadge balance={netBalance} currency={currency} variant="textOnly" />
      </YStack>
    </XStack>
  );
};
