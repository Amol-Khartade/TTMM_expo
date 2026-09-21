import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Text } from 'tamagui';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

export interface FloatingActionButtonProps {
  icon: React.ComponentType<any>;
  label?: string;
  onPress: () => void;
  bottom?: number;
  right?: number;
  accessibilityLabel?: string;
  backgroundColor?: string;
  delay?: number;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  label,
  onPress,
  bottom = 20,
  right = 20,
  accessibilityLabel,
  backgroundColor = '#0284c7',
  delay = 150,
  style,
}) => {
  return (
    <MotiView
      from={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, delay }}
      style={[styles.container, { bottom, right }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label || 'Action button'}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onPress();
        }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor },
          pressed && { transform: [{ scale: 0.92 }], opacity: 0.9 },
        ]}
      >
        <Icon size={22} color="white" strokeWidth={2.2} />
        {label && (
          <Text color="white" fontWeight="800" fontSize="$3">
            {label}
          </Text>
        )}
      </Pressable>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 99,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    minHeight: 48,
  },
});
