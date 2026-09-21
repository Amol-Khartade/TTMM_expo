import React, { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Input, Label } from 'tamagui';
import { X, TrendingUp } from '@tamagui/lucide-icons';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/utils/formatters';

interface DepositModalProps {
  goal: SavingsGoal | null;
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ goal, open, onClose }: DepositModalProps) {
  const addSavingsDeposit = useFinanceStore((state) => state.addSavingsDeposit);
  
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!goal || !amount) return;
    
    addSavingsDeposit(goal.id, parseFloat(amount) || 0, note);
    
    setAmount('');
    setNote('');
    onClose();
  };

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentSaved;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.65)" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <GlassCard variant="elevated" borderRadius={28} p={22} style={styles.sheetContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4" paddingBottom="$8">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">Add Deposit</Text>
                  <Button size="$3" circular icon={X} variant="outlined" onPress={onClose} />
                </XStack>

                <YStack gap="$1" paddingBottom="$2">
                  <Text color="$gray10">Contributing to: <Text fontWeight="bold" color="$text">{goal.title}</Text></Text>
                  <Text color="$gray10">Remaining: <Text color={goal.color || '$blue10'}>{formatCurrency(remaining > 0 ? remaining : 0, goal.currency)}</Text></Text>
                </YStack>

                <YStack gap="$2">
                  <Label htmlFor="amount">Deposit Amount</Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    size="$5"
                    color={goal.color || '$text'}
                  />
                </YStack>

                <YStack gap="$2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input
                    id="note"
                    placeholder="e.g. Monthly contribution"
                    value={note}
                    onChangeText={setNote}
                  />
                </YStack>

                <Button
                  marginTop="$4"
                  size="$4"
                  theme="active"
                  backgroundColor={goal.color || '$blue10'}
                  color="white"
                  icon={TrendingUp}
                  onPress={handleSave}
                  disabled={!amount}
                  opacity={!amount ? 0.5 : 1}
                >
                  Deposit Now
                </Button>
              </YStack>
            </ScrollView>
          </KeyboardAvoidingView>
        </GlassCard>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: '85%',
  },
});
