import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitTypeSelectorProps {
  splitType: SplitType;
  onChangeSplitType: (type: SplitType) => void;
  style?: ViewStyle;
}

export const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({
  splitType,
  onChangeSplitType,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <XStack
      backgroundColor={isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(0, 0, 0, 0.04)'}
      p="$1"
      borderRadius={16}
      borderWidth={1}
      borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.85)'}
      style={[styles.container, style]}
    >
      {(['equal', 'exact', 'percentage', 'shares'] as const).map((type) => {
        const isSelected = splitType === type;

        return (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${type} split mode`}
            onPress={() => {
              if (!isSelected) {
                Haptics.selectionAsync().catch(() => {});
                onChangeSplitType(type);
              }
            }}
            style={[
              styles.splitTypeButton,
              isSelected && (isDark ? styles.splitActiveDark : styles.splitActiveLight),
            ]}
          >
            <Text
              fontSize={11}
              fontWeight={isSelected ? '800' : '600'}
              color={isSelected ? (isDark ? '#38bdf8' : '#0284c7') : '$gray10'}
              textTransform="uppercase"
            >
              {type}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  splitTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 36,
  },
  splitActiveLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.90)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  splitActiveDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
});
