import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { XStack, Text } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export interface FilterPillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: any;
  count?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  active,
  onPress,
  icon: IconComponent,
  count,
  style,
  accessibilityLabel,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel || label}
      onPress={handlePress}
      style={[
        styles.pill,
        active
          ? styles.pillActive
          : isDark
          ? styles.pillInactiveDark
          : styles.pillInactiveLight,
        style,
      ]}
    >
      <XStack alignItems="center" gap="$1.5">
        {IconComponent && (
          <IconComponent
            size={14}
            color={active ? 'white' : isDark ? '#94a3b8' : '#64748b'}
          />
        )}
        <Text
          fontSize="$2"
          fontWeight={active ? '800' : '600'}
          color={active ? 'white' : isDark ? '$gray11' : '$gray10'}
        >
          {label}
        </Text>
        {count !== undefined && (
          <Text
            fontSize={11}
            fontWeight="700"
            color={active ? 'rgba(255,255,255,0.85)' : '$gray9'}
          >
            ({count})
          </Text>
        )}
      </XStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#0284c7',
  },
  pillInactiveLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
  },
  pillInactiveDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
});
