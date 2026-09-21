import React from 'react';
import { Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { X, Check } from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';
import { GlassCard } from '@/components/ui/GlassCard';

interface EditCurrencyModalProps {
  open: boolean;
  onClose: () => void;
}

const POPULAR_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export function EditCurrencyModal({ open, onClose }: EditCurrencyModalProps) {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const setSelectedCurrency = useAppStore((state) => state.setSelectedCurrency);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    onClose();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.65)" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <GlassCard variant="elevated" borderRadius={28} p={22} style={styles.sheetContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$4" paddingBottom="$8">
              <XStack justifyContent="space-between" alignItems="center" paddingBottom="$2">
                <Text fontSize="$6" fontWeight="bold">Select Currency</Text>
                <Button size="$3" circular icon={X} variant="outlined" onPress={onClose} />
              </XStack>

              <YStack gap="$2">
                {POPULAR_CURRENCIES.map((currency) => (
                  <Pressable key={currency.code} onPress={() => handleSelect(currency.code)}>
                    <XStack
                      padding="$3"
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="space-between"
                      backgroundColor={selectedCurrency === currency.code ? 'rgba(56, 189, 248, 0.15)' : 'transparent'}
                    >
                      <XStack gap="$3" alignItems="center">
                        <Text fontSize="$5" fontWeight="bold" width={30}>
                          {currency.symbol}
                        </Text>
                        <YStack>
                          <Text fontSize="$4" fontWeight="600">{currency.code}</Text>
                          <Text fontSize="$2" color="$gray10">{currency.name}</Text>
                        </YStack>
                      </XStack>
                      {selectedCurrency === currency.code && (
                        <Check size={20} color="#38bdf8" />
                      )}
                    </XStack>
                  </Pressable>
                ))}
              </YStack>
            </YStack>
          </ScrollView>
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
