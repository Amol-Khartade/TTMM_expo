import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import { ArrowRight, Wallet } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

export interface SuggestedSettlementCardProps {
  fromName: string;
  toName: string;
  amount: number;
  currency: string;
  isPayer?: boolean;
  isReceiver?: boolean;
  index?: number;
  onSettlePress: () => void;
  style?: ViewStyle;
}

export const SuggestedSettlementCard: React.FC<SuggestedSettlementCardProps> = ({
  fromName,
  toName,
  amount,
  currency,
  isPayer = false,
  isReceiver = false,
  index = 0,
  onSettlePress,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const oweColor = isDark ? '#fb7185' : '#e11d48';
  const owedColor = isDark ? '#4ade80' : '#16a34a';

  return (
    <GlassCard
      variant="card"
      borderRadius={20}
      p={14}
      animate
      delay={index * 40}
      style={[styles.card, style]}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2.5" alignItems="center" flex={1}>
          <YStack flex={1}>
            <XStack alignItems="center" gap="$1.5">
              <Text fontWeight="800" fontSize="$4" color={isPayer ? oweColor : '$color'}>
                {fromName}
              </Text>
              <ArrowRight size={14} color="#64748b" />
              <Text fontWeight="800" fontSize="$4" color={isReceiver ? owedColor : '$color'}>
                {toName}
              </Text>
            </XStack>
            {isPayer ? (
              <Text fontSize="$1" fontWeight="700" color={oweColor} mt="$0.5">
                You owe this payment
              </Text>
            ) : isReceiver ? (
              <Text fontSize="$1" fontWeight="700" color={owedColor} mt="$0.5">
                Owes you
              </Text>
            ) : null}
          </YStack>
        </XStack>

        <YStack alignItems="flex-end" gap="$1">
          <Text fontWeight="900" fontSize="$5" color={owedColor}>
            {currency} {amount.toFixed(2)}
          </Text>
          <Button
            size="$2"
            borderRadius="$3"
            backgroundColor="$blue10"
            color="white"
            icon={<Wallet size={12} color="white" />}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onSettlePress();
            }}
          >
            <Text color="white" fontWeight="700" fontSize="$1">
              Settle Up
            </Text>
          </Button>
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
