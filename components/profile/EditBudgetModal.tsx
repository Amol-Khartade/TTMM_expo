import React, { useState, useEffect } from 'react';
import { Modal, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Input, Label } from 'tamagui';
import { X, Save } from '@tamagui/lucide-icons';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { GlassCard } from '@/components/ui/GlassCard';

interface EditBudgetModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditBudgetModal({ open, onClose }: EditBudgetModalProps) {
  const monthlyBudget = useFinanceStore((state) => state.monthlyBudget);
  const setMonthlyBudget = useFinanceStore((state) => state.setMonthlyBudget);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  
  const [budget, setBudget] = useState(monthlyBudget.toString());

  useEffect(() => {
    if (open) {
      setBudget(monthlyBudget.toString());
    }
  }, [open, monthlyBudget]);

  const handleSave = () => {
    const newBudget = parseFloat(budget);
    if (!isNaN(newBudget) && newBudget > 0) {
      setMonthlyBudget(newBudget);
      onClose();
    }
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.65)" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <GlassCard variant="elevated" borderRadius={28} p={22} style={styles.sheetContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4" paddingBottom="$8">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$6" fontWeight="bold">Monthly Budget</Text>
                  <Button size="$3" circular icon={X} variant="outlined" onPress={onClose} />
                </XStack>

                <YStack gap="$2">
                  <Label htmlFor="budget">Limit ({selectedCurrency})</Label>
                  <Input
                    id="budget"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                    size="$5"
                  />
                  <Text fontSize="$2" color="$gray10">
                    Set a target to keep your monthly spending in check.
                  </Text>
                </YStack>

                <Button
                  marginTop="$4"
                  size="$4"
                  theme="active"
                  icon={Save}
                  onPress={handleSave}
                  disabled={!budget || isNaN(parseFloat(budget))}
                  opacity={(!budget || isNaN(parseFloat(budget))) ? 0.5 : 1}
                >
                  Save Budget
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
