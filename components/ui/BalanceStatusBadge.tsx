import React from 'react';
import { XStack, Text } from 'tamagui';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from '@tamagui/lucide-icons';
import { getNetBalanceMeta } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

export interface BalanceStatusBadgeProps {
  balance: number;
  currency?: string;
  variant?: 'badge' | 'textOnly' | 'compact';
}

export const BalanceStatusBadge: React.FC<BalanceStatusBadgeProps> = ({
  balance,
  currency = '₹',
  variant = 'badge',
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const meta = getNetBalanceMeta(balance, currency);

  if (variant === 'textOnly') {
    if (meta.status === 'owed') {
      return (
        <Text fontWeight="900" fontSize="$3" color={isDark ? '#4ade80' : '#16a34a'}>
          {meta.text}
        </Text>
      );
    }
    if (meta.status === 'owing') {
      return (
        <Text fontWeight="900" fontSize="$3" color={isDark ? '#fb7185' : '#e11d48'}>
          {meta.text}
        </Text>
      );
    }
    return (
      <Text fontWeight="700" fontSize="$2" color="$gray10">
        Settled
      </Text>
    );
  }

  if (variant === 'compact') {
    if (meta.status === 'owed') {
      return (
        <XStack alignItems="center" gap="$1">
          <ArrowUpRight size={14} color={isDark ? '#4ade80' : '#16a34a'} />
          <Text fontWeight="900" fontSize="$4" color={isDark ? '#4ade80' : '#16a34a'}>
            {meta.text}
          </Text>
        </XStack>
      );
    }
    if (meta.status === 'owing') {
      return (
        <XStack alignItems="center" gap="$1">
          <ArrowDownLeft size={14} color={isDark ? '#fb7185' : '#e11d48'} />
          <Text fontWeight="900" fontSize="$4" color={isDark ? '#fb7185' : '#e11d48'}>
            {meta.text}
          </Text>
        </XStack>
      );
    }
    return (
      <XStack alignItems="center" gap="$1">
        <CheckCircle2 size={14} color="#16a34a" />
        <Text fontWeight="700" fontSize="$2" color="$gray10">
          Settled
        </Text>
      </XStack>
    );
  }

  // Full badge style (e.g. in GroupHeroCard)
  if (meta.status === 'owed') {
    return (
      <XStack
        backgroundColor={isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(22, 163, 74, 0.10)'}
        px="$2.5"
        py="$1.5"
        borderRadius="$4"
        alignItems="center"
        gap="$1.5"
        mt="$1"
        borderWidth={1}
        borderColor={isDark ? 'rgba(34, 197, 94, 0.30)' : 'rgba(22, 163, 74, 0.22)'}
      >
        <ArrowUpRight size={16} color={isDark ? '#4ade80' : '#16a34a'} />
        <Text fontWeight="900" fontSize="$4" color={isDark ? '#4ade80' : '#16a34a'}>
          {meta.text}
        </Text>
      </XStack>
    );
  }

  if (meta.status === 'owing') {
    return (
      <XStack
        backgroundColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.10)'}
        px="$2.5"
        py="$1.5"
        borderRadius="$4"
        alignItems="center"
        gap="$1.5"
        mt="$1"
        borderWidth={1}
        borderColor={isDark ? 'rgba(244, 63, 94, 0.30)' : 'rgba(225, 29, 72, 0.22)'}
      >
        <ArrowDownLeft size={16} color={isDark ? '#fb7185' : '#e11d48'} />
        <Text fontWeight="900" fontSize="$4" color={isDark ? '#fb7185' : '#e11d48'}>
          {meta.text}
        </Text>
      </XStack>
    );
  }

  return (
    <XStack
      backgroundColor={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'}
      px="$2.5"
      py="$1.5"
      borderRadius="$4"
      alignItems="center"
      gap="$1.5"
      mt="$1"
      borderWidth={1}
      borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)'}
    >
      <CheckCircle2 size={16} color="#16a34a" />
      <Text fontWeight="800" fontSize="$3" color="$gray11">
        Settled up
      </Text>
    </XStack>
  );
};
