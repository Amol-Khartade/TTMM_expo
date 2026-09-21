import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

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
  const isDark = useAppStore((state) => state.isDark);

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
              {currency} {totalGroupSpend.toFixed(2)}
            </Text>
          </YStack>

          {/* User Net Balance Badge */}
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
            {userNetBalance > 0.01 ? (
              <XStack
                backgroundColor={isDark ? 'rgba(22, 101, 52, 0.3)' : '#dcfce7'}
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
                borderWidth={1}
                borderColor={isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0'}
              >
                <ArrowUpRight size={16} color="#15803d" />
                <Text fontWeight="900" fontSize="$4" color="#15803d">
                  +{currency} {userNetBalance.toFixed(2)}
                </Text>
              </XStack>
            ) : userNetBalance < -0.01 ? (
              <XStack
                backgroundColor={isDark ? 'rgba(159, 18, 57, 0.3)' : '#ffe4e6'}
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
                borderWidth={1}
                borderColor={isDark ? 'rgba(244, 63, 94, 0.3)' : '#fecdd3'}
              >
                <ArrowDownLeft size={16} color="#be123c" />
                <Text fontWeight="900" fontSize="$4" color="#be123c">
                  -{currency} {Math.abs(userNetBalance).toFixed(2)}
                </Text>
              </XStack>
            ) : (
              <XStack
                backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : '$gray3'}
                px="$2.5"
                py="$1.5"
                borderRadius="$4"
                alignItems="center"
                gap="$1.5"
                mt="$1"
              >
                <CheckCircle2 size={16} color="#16a34a" />
                <Text fontWeight="800" fontSize="$3" color="$gray11">
                  Settled up
                </Text>
              </XStack>
            )}
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
