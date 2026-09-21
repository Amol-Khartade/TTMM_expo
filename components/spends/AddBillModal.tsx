import React, { useState } from 'react';
import { Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YStack, XStack, Text, H3, Paragraph, Input, Button, Separator } from 'tamagui';
import { X, CreditCard, Check } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { CategorySelector } from '@/components/expenses/CategorySelector';
import { FilterPill } from '@/components/ui/FilterPill';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { ENV } from '@/constants';

export interface AddBillModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({ open, onClose }) => {
  const isDark = useAppStore((state) => state.isDark);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const addBill = useFinanceStore((state) => state.addBill);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [category, setCategory] = useState('utilities');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [payeeUpiId, setPayeeUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDueDay('5');
    setCategory('utilities');
    setFrequency('monthly');
    setPayeeUpiId('');
    setPayeeName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    const numDay = parseInt(dueDay, 10);

    if (!title.trim()) {
      setError('Please enter a bill title (e.g. Electricity, Rent, Wi-Fi).');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }
    if (isNaN(numDay) || numDay < 1 || numDay > 31) {
      setError('Due day must be between 1 and 31.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    addBill({
      title: title.trim(),
      amount: numAmount,
      currency: selectedCurrency || ENV.DEFAULTS.CURRENCY,
      dueDay: numDay,
      category,
      frequency,
      payeeUpiId: payeeUpiId.trim() || undefined,
      payeeName: payeeName.trim() || undefined,
    });

    handleClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={handleClose}>
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.65)" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <GlassCard
          variant="elevated"
          borderRadius={28}
          p={22}
          style={styles.sheetContainer}
        >
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" mb="$3">
            <YStack>
              <H3 fontSize="$5" fontWeight="900" color="$color">
                Add Recurring Bill
              </H3>
              <Paragraph fontSize="$1" color="$gray10">
                Track dues and launch 1-tap UPI payments
              </Paragraph>
            </YStack>

            <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn}>
              <X size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </XStack>

          <Separator my="$2" opacity={0.12} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <YStack gap="$3.5">
              {error && (
                <YStack
                  backgroundColor="rgba(239, 68, 68, 0.12)"
                  borderColor="rgba(239, 68, 68, 0.3)"
                  borderWidth={1}
                  p="$2"
                  borderRadius="$3"
                >
                  <Text fontSize={12} color="#ef4444" fontWeight="700">
                    {error}
                  </Text>
                </YStack>
              )}

              {/* Title Input */}
              <YStack gap="$1">
                <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                  Bill Title
                </Text>
                <Input
                  placeholder="e.g. Electricity Bill, Wi-Fi, Rent"
                  value={title}
                  onChangeText={setTitle}
                  size="$4"
                  borderRadius={14}
                  backgroundColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                />
              </YStack>

              {/* Amount & Due Day Row */}
              <XStack gap="$3">
                <YStack flex={2} gap="$1">
                  <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                    Amount ({selectedCurrency})
                  </Text>
                  <Input
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={setAmount}
                    size="$4"
                    borderRadius={14}
                    backgroundColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                  />
                </YStack>

                <YStack flex={1} gap="$1">
                  <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                    Due Day (1-31)
                  </Text>
                  <Input
                    placeholder="5"
                    keyboardType="number-pad"
                    maxLength={2}
                    value={dueDay}
                    onChangeText={setDueDay}
                    size="$4"
                    borderRadius={14}
                    backgroundColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                  />
                </YStack>
              </XStack>

              {/* Payee UPI ID (Optional) */}
              <YStack gap="$1">
                <XStack alignItems="center" gap="$1">
                  <CreditCard size={13} color="$gray10" />
                  <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                    Payee UPI ID (Optional)
                  </Text>
                </XStack>
                <Input
                  placeholder="e.g. landlord@okhdfcbank, airtel@upi"
                  value={payeeUpiId}
                  onChangeText={setPayeeUpiId}
                  autoCapitalize="none"
                  size="$4"
                  borderRadius={14}
                  backgroundColor={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}
                />
              </YStack>

              {/* Category Selection */}
              <YStack gap="$2">
                <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                  Category
                </Text>
                <CategorySelector
                  selectedCategory={category}
                  onSelectCategory={setCategory}
                />
              </YStack>

              {/* Frequency Selection */}
              <YStack gap="$2">
                <Text fontSize="$2" fontWeight="800" color="$gray10" textTransform="uppercase">
                  Frequency
                </Text>
                <XStack gap="$2">
                  {(['monthly', 'quarterly', 'yearly'] as const).map((freq) => (
                    <FilterPill
                      key={freq}
                      label={freq.charAt(0).toUpperCase() + freq.slice(1)}
                      active={frequency === freq}
                      onPress={() => setFrequency(freq)}
                    />
                  ))}
                </XStack>
              </YStack>

              {/* Action Buttons */}
              <XStack gap="$2.5" mt="$3">
                <Button
                  flex={1}
                  size="$4"
                  borderRadius={16}
                  backgroundColor="$color3"
                  onPress={handleClose}
                >
                  <Text fontWeight="800" color="$color">
                    Cancel
                  </Text>
                </Button>

                <Button
                  flex={2}
                  size="$4"
                  borderRadius={16}
                  backgroundColor="#0284c7"
                  pressStyle={{ opacity: 0.85, scale: 0.96 }}
                  onPress={handleSubmit}
                  icon={<Check size={18} color="#ffffff" />}
                >
                  <Text fontWeight="900" color="#ffffff">
                    Save Bill
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </ScrollView>
        </GlassCard>
      </YStack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85%',
  },
});
