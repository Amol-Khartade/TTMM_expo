import React from 'react';
import { StyleSheet, Image, Pressable } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { Sparkles, Trash2, Receipt, CheckCircle2 } from '@tamagui/lucide-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency } from '@/utils/formatters';
import { ParsedReceipt } from '@/services/receiptScannerService';
import { useAppStore } from '@/store/useAppStore';

export interface ReceiptBadgeCardProps {
  receipt: ParsedReceipt;
  onRemove: () => void;
  onPressPreview?: () => void;
}

export const ReceiptBadgeCard: React.FC<ReceiptBadgeCardProps> = ({
  receipt,
  onRemove,
  onPressPreview,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <GlassCard variant="elevated" p={12} borderRadius={18}>
      <XStack alignItems="center" justifyContent="space-between" gap="$3">
        {/* Receipt Image Thumbnail */}
        <Pressable onPress={onPressPreview} style={styles.thumbnailContainer}>
          {receipt.imageUri ? (
            <Image
              source={{ uri: receipt.imageUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <YStack
              width={48}
              height={48}
              borderRadius={12}
              backgroundColor={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.10)'}
              alignItems="center"
              justifyContent="center"
            >
              <Receipt size={22} color={isDark ? '#38bdf8' : '#0284c7'} />
            </YStack>
          )}
        </Pressable>

        {/* Extracted Details */}
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$1.5">
            <Sparkles size={13} color="#06b6d4" />
            <Text
              fontSize={11}
              fontWeight="800"
              color="#06b6d4"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              AI Extracted Receipt
            </Text>
          </XStack>

          <Text fontSize={15} fontWeight="800" color="$color" numberOfLines={1}>
            {receipt.title}
          </Text>

          <XStack alignItems="center" gap="$2">
            <Text fontSize={13} fontWeight="700" color="#16a34a">
              {formatCurrency(receipt.amount, receipt.currency)}
            </Text>
            <XStack alignItems="center" gap="$1">
              <CheckCircle2 size={12} color="#16a34a" />
              <Text fontSize={11} color="$gray10" fontWeight="600">
                {Math.round(receipt.confidence * 100)}% match
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Remove / Reset Button */}
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityLabel="Remove scanned receipt"
          style={({ pressed }) => [
            styles.removeButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Trash2 size={18} color="#ef4444" />
        </Pressable>
      </XStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  removeButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
  },
});
