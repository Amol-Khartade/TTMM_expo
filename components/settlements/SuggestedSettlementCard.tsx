import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Button } from 'tamagui';
import { ArrowRight, Wallet } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';

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
              <Text fontWeight="800" fontSize="$4" color={isPayer ? '#e11d48' : '$color'}>
                {fromName}
              </Text>
              <ArrowRight size={14} color="#64748b" />
              <Text fontWeight="800" fontSize="$4" color={isReceiver ? '#16a34a' : '$color'}>
                {toName}
              </Text>
            </XStack>
            {isPayer ? (
              <Text fontSize="$1" fontWeight="700" color="#e11d48" mt="$0.5">
                You owe this payment
              </Text>
            ) : isReceiver ? (
              <Text fontSize="$1" fontWeight="700" color="#16a34a" mt="$0.5">
                Owes you
              </Text>
            ) : null}
          </YStack>
        </XStack>

        <YStack alignItems="flex-end" gap="$1">
          <Text fontWeight="900" fontSize="$5" color="#16a34a">
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
