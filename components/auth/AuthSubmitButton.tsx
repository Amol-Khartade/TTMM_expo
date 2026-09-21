import React from 'react';
import { StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { XStack, Text } from 'tamagui';
import { ArrowRight } from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';

export interface AuthSubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  loadingLabel: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  isSubmitting,
  label,
  loadingLabel,
  onPress,
  accessibilityLabel,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <Pressable
      onPress={onPress}
      disabled={isSubmitting}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: isDark ? '#38bdf8' : '#0284c7',
          shadowColor: isDark ? '#38bdf8' : '#0284c7',
        },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        isSubmitting && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      {isSubmitting ? (
        <XStack alignItems="center" gap="$2">
          <ActivityIndicator
            size="small"
            color={isDark ? '#0B0F17' : '#FFFFFF'}
          />
          <Text
            fontWeight="800"
            fontSize="$3"
            color={isDark ? '#0B0F17' : '#FFFFFF'}
          >
            {loadingLabel}
          </Text>
        </XStack>
      ) : (
        <XStack alignItems="center" gap="$2">
          <Text
            fontWeight="800"
            fontSize="$3"
            color={isDark ? '#0B0F17' : '#FFFFFF'}
          >
            {label}
          </Text>
          <ArrowRight size={18} color={isDark ? '#0B0F17' : '#FFFFFF'} />
        </XStack>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
});
