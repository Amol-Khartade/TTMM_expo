import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  CreditCard,
} from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/utils/formatters';
import { launchUPIPayment } from '@/services/upiService';
import { Bill } from '@/types';
import { useAppStore } from '@/store/useAppStore';

export interface BillItemCardProps {
  bill: Bill;
  onMarkPaid: (id: string) => void;
  onResetStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const BillItemCard: React.FC<BillItemCardProps> = ({
  bill,
  onMarkPaid,
  onResetStatus,
  onDelete,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  const today = new Date().getDate();
  const daysDiff = bill.dueDay - today;

  let dueBadgeText = '';
  let dueBadgeColor = '#10b981';
  let dueBadgeBg = 'rgba(16, 185, 129, 0.12)';

  if (bill.status === 'paid') {
    dueBadgeText = 'Paid this month';
    dueBadgeColor = '#10b981';
    dueBadgeBg = 'rgba(16, 185, 129, 0.12)';
  } else if (daysDiff < 0) {
    dueBadgeText = `Overdue by ${Math.abs(daysDiff)}d`;
    dueBadgeColor = '#ef4444';
    dueBadgeBg = 'rgba(239, 68, 68, 0.12)';
  } else if (daysDiff === 0) {
    dueBadgeText = 'Due Today';
    dueBadgeColor = '#f59e0b';
    dueBadgeBg = 'rgba(245, 158, 11, 0.12)';
  } else {
    dueBadgeText = `Due in ${daysDiff} days`;
    dueBadgeColor = daysDiff <= 3 ? '#f59e0b' : isDark ? '#38bdf8' : '#0284c7';
    dueBadgeBg = daysDiff <= 3
      ? 'rgba(245, 158, 11, 0.12)'
      : isDark
      ? 'rgba(56, 189, 248, 0.12)'
      : 'rgba(2, 132, 199, 0.08)';
  }

  const handlePayViaUPI = async () => {
    if (!bill.payeeUpiId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await launchUPIPayment({
      payeeUpiId: bill.payeeUpiId,
      payeeName: bill.payeeName || bill.title,
      amount: bill.amount,
      currency: bill.currency,
      transactionNote: `Bill Payment: ${bill.title}`,
    });
  };

  return (
    <GlassCard variant="elevated" borderRadius={20} p={14}>
      <YStack gap="$2.5">
        {/* Header Row */}
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2">
          <YStack flex={1}>
            <XStack alignItems="center" gap="$1.5" mb="$0.5">
              <XStack
                backgroundColor={dueBadgeBg}
                px="$2"
                py="$0.5"
                borderRadius="$3"
                alignItems="center"
                gap="$1"
              >
                {bill.status === 'paid' ? (
                  <CheckCircle2 size={11} color={dueBadgeColor} />
                ) : daysDiff <= 0 ? (
                  <AlertCircle size={11} color={dueBadgeColor} />
                ) : (
                  <Clock size={11} color={dueBadgeColor} />
                )}
                <Text fontSize={10} fontWeight="800" color={dueBadgeColor}>
                  {dueBadgeText}
                </Text>
              </XStack>
              <Text fontSize={11} color="$gray10" fontWeight="600">
                • Due {bill.dueDay}th of month
              </Text>
            </XStack>

            <Text fontSize="$4" fontWeight="800" color="$color" numberOfLines={1}>
              {bill.title}
            </Text>

            {bill.payeeUpiId ? (
              <XStack alignItems="center" gap="$1" mt="$0.5">
                <CreditCard size={12} color="$gray10" />
                <Text fontSize={11} color="$gray10" fontWeight="600">
                  UPI: {bill.payeeUpiId}
                </Text>
              </XStack>
            ) : null}
          </YStack>

          <YStack alignItems="flex-end">
            <Text fontSize="$5" fontWeight="900" color="$color">
              {formatCurrency(bill.amount, bill.currency)}
            </Text>
            <Text fontSize={10} color="$gray10" textTransform="uppercase" fontWeight="700">
              {bill.frequency}
            </Text>
          </YStack>
        </XStack>

        {/* Action Buttons Row */}
        <XStack gap="$2" pt="$1" alignItems="center">
          {bill.status === 'unpaid' ? (
            <>
              {bill.payeeUpiId ? (
                <Button
                  flex={1}
                  size="$3"
                  borderRadius="$4"
                  backgroundColor="#0284c7"
                  pressStyle={{ opacity: 0.85, scale: 0.96 }}
                  icon={<ArrowUpRight size={14} color="#ffffff" />}
                  onPress={handlePayViaUPI}
                >
                  <Text color="#ffffff" fontWeight="800" fontSize="$2">
                    Pay via UPI
                  </Text>
                </Button>
              ) : null}

              <Button
                flex={1}
                size="$3"
                borderRadius="$4"
                backgroundColor={isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.10)'}
                borderColor={isDark ? 'rgba(16, 185, 129, 0.32)' : 'rgba(16, 185, 129, 0.22)'}
                borderWidth={1}
                pressStyle={{ opacity: 0.85, scale: 0.96 }}
                icon={<CheckCircle2 size={14} color="#10b981" />}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  onMarkPaid(bill.id);
                }}
              >
                <Text color="#10b981" fontWeight="800" fontSize="$2">
                  Mark as Paid
                </Text>
              </Button>
            </>
          ) : (
            <Button
              flex={1}
              size="$3"
              borderRadius="$4"
              backgroundColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}
              pressStyle={{ opacity: 0.85, scale: 0.96 }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onResetStatus(bill.id);
              }}
            >
              <Text color="$gray11" fontWeight="700" fontSize="$2">
                Mark as Unpaid
              </Text>
            </Button>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onDelete(bill.id);
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
            ]}
          >
            <Trash2 size={16} color="#ef4444" />
          </Pressable>
        </XStack>
      </YStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  deleteBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
});
