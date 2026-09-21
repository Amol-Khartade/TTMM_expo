import React, { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Input, Label } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { useFinanceStore } from '@/store/useFinanceStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ENV } from '@/constants';

interface AddSavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function AddSavingsGoalModal({ open, onClose }: AddSavingsGoalModalProps) {
  const addSavingsGoal = useFinanceStore((state) => state.addSavingsGoal);
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSave = () => {
    if (!title || !targetAmount) return;
    
    addSavingsGoal({
      title,
      targetAmount: parseFloat(targetAmount) || 0,
      currency: ENV.DEFAULTS.CURRENCY,
      color: selectedColor,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      initialDeposit: parseFloat(initialDeposit) || 0,
    });
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setInitialDeposit('');
    setTargetDate('');
    setSelectedColor(COLORS[0]);
  };

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
                  <Text fontSize="$6" fontWeight="bold">New Savings Goal</Text>
                  <Button size="$3" circular icon={X} variant="outlined" onPress={onClose} />
                </XStack>

                <YStack gap="$2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Goa Trip, Emergency Fund"
                    value={title}
                    onChangeText={setTitle}
                  />
                </YStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$2">
                    <Label htmlFor="targetAmount">Target Amount ({ENV.DEFAULTS.CURRENCY})</Label>
                    <Input
                      id="targetAmount"
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={targetAmount}
                      onChangeText={setTargetAmount}
                    />
                  </YStack>
                  <YStack flex={1} gap="$2">
                    <Label htmlFor="initial">Initial Deposit</Label>
                    <Input
                      id="initial"
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={initialDeposit}
                      onChangeText={setInitialDeposit}
                    />
                  </YStack>
                </XStack>

                <YStack gap="$2">
                  <Label htmlFor="targetDate">Target Date (YYYY-MM-DD) Optional</Label>
                  <Input
                    id="targetDate"
                    placeholder="e.g. 2024-12-31"
                    value={targetDate}
                    onChangeText={setTargetDate}
                  />
                </YStack>

                <YStack gap="$2">
                  <Label>Theme Color</Label>
                  <XStack flexWrap="wrap" gap="$3">
                    {COLORS.map((color) => (
                      <Button
                        key={color}
                        size="$3"
                        circular
                        backgroundColor={color}
                        borderWidth={selectedColor === color ? 3 : 0}
                        borderColor="$text"
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </XStack>
                </YStack>

                <Button
                  marginTop="$4"
                  size="$4"
                  theme="active"
                  onPress={handleSave}
                  disabled={!title || !targetAmount}
                  opacity={(!title || !targetAmount) ? 0.5 : 1}
                >
                  Create Goal
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
