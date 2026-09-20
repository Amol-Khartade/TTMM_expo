import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H2,
  Paragraph,
  Input,
} from 'tamagui';
import { X, Check, QrCode, Banknote, ArrowRight } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGroupDetailsQuery } from '@/queries/useGroups';
import { useCreateSettlementMutation } from '@/queries/useSettlements';
import { launchUPIPayment } from '@/services/upiService';
import { useAppStore } from '@/store/useAppStore';
import { GroupMember } from '@/types';

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

    if (payeeUpiId) {
      await launchUPIPayment({
        payeeUpiId,
        payeeName: toMember?.displayName || 'TTMM User',
        amount: numAmount,
        currency: selectedCurrency,
        transactionNote: `Settlement in ${group?.name || 'TTMM'}`,
      });
    }

    // Record settlement in Firestore
    await recordSettlement('upi');
  };

  const recordSettlement = async (method: 'upi' | 'cash') => {
    const numAmount = parseFloat(settleAmount) || 0;
    if (numAmount <= 0) return;

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
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center" py="$3">
        <Button
          size="$3"
          circular
          chromeless
          icon={<X size={22} />}
          onPress={() => router.back()}
        />
        <H2 fontWeight="900" fontSize="$5">
          Settle Debt
        </H2>
        <YStack width={40} />
      </XStack>

      {/* Settle Details Card */}
      <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" borderRadius="$6" alignItems="center">
        <Paragraph size="$2" color="$gray10" textTransform="uppercase" fontWeight="700">
          Settlement Amount
        </Paragraph>
        <XStack alignItems="center" gap="$2" my="$2">
          <Text fontSize="$8" fontWeight="900">
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
            textAlign="center"
          />
        </XStack>

        <XStack gap="$3" alignItems="center" mt="$3">
          <Text fontWeight="700" fontSize="$4">
            {fromMember?.displayName || 'Payer'}
          </Text>
          <ArrowRight size={18} color="#64748b" />
          <Text fontWeight="700" fontSize="$4">
            {toMember?.displayName || 'Receiver'}
          </Text>
        </XStack>
      </Card>

      {/* Payment Options */}
      <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" borderRadius="$5">
        <Text fontWeight="700" fontSize="$3" color="$gray10" mb="$3" textTransform="uppercase">
          Select Payment Method
        </Text>

        <XStack gap="$3" mb="$4">
          <Button
            flex={1}
            size="$3.5"
            theme={paymentMethod === 'upi' ? 'active' : undefined}
            chromeless={paymentMethod !== 'upi'}
            icon={<QrCode size={18} />}
            onPress={() => setPaymentMethod('upi')}
          >
            UPI Intent
          </Button>
          <Button
            flex={1}
            size="$3.5"
            theme={paymentMethod === 'cash' ? 'active' : undefined}
            chromeless={paymentMethod !== 'cash'}
            icon={<Banknote size={18} />}
            onPress={() => setPaymentMethod('cash')}
          >
            Cash
          </Button>
        </XStack>

        {paymentMethod === 'upi' && (
          <YStack gap="$2">
            <Paragraph size="$2" color="$gray10">
              Receiver's UPI ID (Google Pay / PhonePe / Paytm):
            </Paragraph>
            <Input
              placeholder="e.g. friend@okaxis"
              value={payeeUpiId}
              onChangeText={setPayeeUpiId}
            />
          </YStack>
        )}
      </Card>

      {/* Action Button */}
      {paymentMethod === 'upi' ? (
        <Button
          size="$4"
          theme="active"
          icon={<QrCode size={20} />}
          onPress={handlePayViaUPI}
          disabled={createSettlementMutation.isPending}
        >
          {createSettlementMutation.isPending ? 'Processing...' : 'Pay via UPI App & Settle'}
        </Button>
      ) : (
        <Button
          size="$4"
          theme="green"
          icon={<Check size={20} />}
          onPress={() => recordSettlement('cash')}
          disabled={createSettlementMutation.isPending}
        >
          {createSettlementMutation.isPending ? 'Recording...' : 'Record as Settled (Cash)'}
        </Button>
      )}
    </YStack>
  );
}
