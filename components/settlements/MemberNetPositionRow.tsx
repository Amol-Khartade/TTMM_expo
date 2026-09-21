import React from 'react';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { useAppStore } from '@/store/useAppStore';

export interface MemberNetPositionRowProps {
  displayName: string;
  initials: string;
  isCurrentUser?: boolean;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
  currency: string;
}

export const MemberNetPositionRow: React.FC<MemberNetPositionRowProps> = ({
  displayName,
  initials,
  isCurrentUser = false,
  totalPaid,
  totalOwed,
  netBalance,
  currency,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <XStack justifyContent="space-between" alignItems="center" py="$1">
      <XStack gap="$2.5" alignItems="center" flex={1}>
        <YStack
          width={34}
          height={34}
          borderRadius={17}
          backgroundColor={
            isCurrentUser
              ? '$blue5'
              : isDark
              ? 'rgba(255,255,255,0.08)'
              : '$gray4'
          }
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={12}
            fontWeight="800"
            color={isCurrentUser ? '#0284c7' : '$gray11'}
          >
            {initials}
          </Text>
        </YStack>
        <YStack flex={1}>
          <Text fontWeight="700" fontSize="$3" color="$color">
            {displayName} {isCurrentUser ? '(You)' : ''}
          </Text>
          <Paragraph size="$1" color="$gray10">
            Paid: {currency} {totalPaid.toFixed(2)} • Share: {currency} {totalOwed.toFixed(2)}
          </Paragraph>
        </YStack>
      </XStack>

      <YStack alignItems="flex-end">
        {netBalance > 0.01 ? (
          <Text fontWeight="900" fontSize="$3" color="#16a34a">
            +{currency} {netBalance.toFixed(2)}
          </Text>
        ) : netBalance < -0.01 ? (
          <Text fontWeight="900" fontSize="$3" color="#e11d48">
            -{currency} {Math.abs(netBalance).toFixed(2)}
          </Text>
        ) : (
          <Text fontWeight="700" fontSize="$2" color="$gray10">
            Settled
          </Text>
        )}
      </YStack>
    </XStack>
  );
};
