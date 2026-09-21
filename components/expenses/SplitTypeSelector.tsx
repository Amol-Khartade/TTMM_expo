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
      backgroundColor={isDark ? 'rgba(15, 23, 42, 0.6)' : '$gray3'}
      p="$1"
      borderRadius={16}
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
              color={isSelected ? '$color' : '$gray10'}
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
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  splitActiveDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});
