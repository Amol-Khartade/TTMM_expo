import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  H2,
  Paragraph,
  Input,
} from 'tamagui';
import { X, Check, QrCode, Banknote, ArrowRight } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useGroupDetailsQuery } from '@/queries/useGroups';
import { useCreateSettlementMutation } from '@/queries/useSettlements';
import { launchUPIPayment } from '@/services/upiService';
import { useAppStore } from '@/store/useAppStore';
import { GroupMember } from '@/types';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { FilterPill } from '@/components/ui/FilterPill';
import { ENV } from '@/constants';

export default function SettleUpModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id: groupId, from, to, amount } = useLocalSearchParams<{
    id: string;
    from?: string;
    to?: string;
    amount?: string;
  }>();

  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);
  const { data: group } = useGroupDetailsQuery(groupId);
  const createSettlementMutation = useCreateSettlementMutation();

  const [settleAmount, setSettleAmount] = useState(amount || '0');
  const [payeeUpiId, setPayeeUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');

  const fromMember = group?.members.find((m: GroupMember) => m.userId === from);
  const toMember = group?.members.find((m: GroupMember) => m.userId === to);

  const handlePayViaUPI = async () => {
    const numAmount = parseFloat(settleAmount) || 0;
    if (numAmount <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    if (payeeUpiId) {
      await launchUPIPayment({
        payeeUpiId,
        payeeName: toMember?.displayName || `${ENV.APP_NAME} User`,
        amount: numAmount,
        currency: selectedCurrency,
        transactionNote: `Settlement in ${group?.name || ENV.APP_NAME}`,
      });
    }

    // Record settlement in Firestore
    await recordSettlement('upi');
  };

  const recordSettlement = async (method: 'upi' | 'cash') => {
    const numAmount = parseFloat(settleAmount) || 0;
    if (numAmount <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    await createSettlementMutation.mutateAsync({
      groupId,
      fromUserId: from || currentUser?.id || '',
      toUserId: to || '',
      amount: numAmount,
      currency: selectedCurrency,
      status: 'completed',
    });

    router.back();
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" py="$2.5">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.back();
            }}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: isDark ? 'rgba(27, 37, 61, 0.85)' : 'rgba(255, 255, 255, 0.90)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.90)',
              },
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
          >
            <X size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
          </Pressable>

          <H2 fontWeight="900" fontSize="$6" color="$color" letterSpacing={-0.4}>
            Settle Debt
          </H2>

          <YStack width={38} />
        </XStack>

        <YStack flex={1} mt="$2" gap="$3.5">
          {/* Settle Details Glass Card */}
          <MotiView
            from={{ opacity: 0, translateY: -8, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <GlassCard variant="elevated" borderRadius={24} p={20} style={styles.cardCenter}>
              <Paragraph size="$1" color="$gray10" textTransform="uppercase" fontWeight="800" letterSpacing={0.8}>
                Settlement Amount
              </Paragraph>
              <XStack alignItems="center" gap="$2" my="$2">
                <Text fontSize="$8" fontWeight="900" color={isDark ? '#38bdf8' : '#0284c7'}>
                  {selectedCurrency}
                </Text>
                <Input
                  size="$6"
                  keyboardType="decimal-pad"
                  fontWeight="900"
                  fontSize="$8"
                  value={settleAmount}
                  onChangeText={setSettleAmount}
                  borderWidth={0}
                  backgroundColor="transparent"
                  color="$color"
                  textAlign="center"
                />
              </XStack>

              {/* Transfer Direction Indicator */}
              <XStack
                backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                px="$3.5"
                py="$2"
                borderRadius={16}
                borderWidth={1}
                borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.85)'}
                alignItems="center"
                gap="$2.5"
                mt="$2"
              >
                <Text fontWeight="800" fontSize="$3" color={isDark ? '#fb7185' : '#e11d48'}>
                  {fromMember?.displayName || 'Payer'}
                </Text>
                <ArrowRight size={16} color="#64748b" />
                <Text fontWeight="800" fontSize="$3" color={isDark ? '#4ade80' : '#16a34a'}>
                  {toMember?.displayName || 'Receiver'}
                </Text>
              </XStack>
            </GlassCard>
          </MotiView>

          {/* Payment Method Selector Glass Card */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 60 }}
          >
            <GlassCard variant="card" borderRadius={22} p={16}>
              <Text fontWeight="800" fontSize="$2" color="$gray10" mb="$3" textTransform="uppercase" letterSpacing={0.8}>
                Payment Mode
              </Text>

              <XStack gap="$2.5" mb="$3.5">
                <FilterPill
                  label="UPI Payment"
                  active={paymentMethod === 'upi'}
                  onPress={() => setPaymentMethod('upi')}
                  icon={QrCode}
                  style={{ flex: 1 }}
                />
                <FilterPill
                  label="Cash / Direct"
                  active={paymentMethod === 'cash'}
                  onPress={() => setPaymentMethod('cash')}
                  icon={Banknote}
                  style={{ flex: 1 }}
                />
              </XStack>

              {paymentMethod === 'upi' && (
                <YStack gap="$1.5">
                  <Paragraph size="$1" color="$gray10" fontWeight="700">
                    Receiver&apos;s UPI VPA ID (GPay / PhonePe / Paytm):
                  </Paragraph>
                  <Input
                    placeholder="e.g. friend@okaxis or 9876543210@paytm"
                    value={payeeUpiId}
                    onChangeText={setPayeeUpiId}
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(226, 232, 240, 0.90)'}
                    backgroundColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.95)'}
                    color="$color"
                  />
                </YStack>
              )}
            </GlassCard>
          </MotiView>

          {/* Action Trigger */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 100 }}
          >
            {paymentMethod === 'upi' ? (
              <Pressable
                onPress={handlePayViaUPI}
                disabled={createSettlementMutation.isPending}
                style={({ pressed }) => [
                  styles.primaryActionButton,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
              >
                <QrCode size={20} color="white" />
                <Text color="white" fontWeight="800" fontSize="$4">
                  {createSettlementMutation.isPending ? 'Processing...' : 'Pay via UPI App & Settle'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => recordSettlement('cash')}
                disabled={createSettlementMutation.isPending}
                style={({ pressed }) => [
                  styles.greenActionButton,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
              >
                <Check size={20} color="white" />
                <Text color="white" fontWeight="800" fontSize="$4">
                  {createSettlementMutation.isPending ? 'Recording...' : 'Mark as Settled (Cash)'}
                </Text>
              </Pressable>
            )}
          </MotiView>
        </YStack>
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardCenter: {
    alignItems: 'center',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0284c7',
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  greenActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
