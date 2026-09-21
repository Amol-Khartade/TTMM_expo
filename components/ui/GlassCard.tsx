import React from 'react';
import {
  StyleSheet,
  Platform,
  ViewStyle,
  Pressable,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  borderRadius?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  onPress?: () => void;
  animate?: boolean;
  delay?: number;
  borderWidth?: number;
  variant?: 'subtle' | 'card' | 'elevated' | 'glow';
  glowColor?: string;
  p?: number;
  px?: number;
  py?: number;
  padding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentStyle,
  borderRadius = 22,
  intensity = 60,
  tint,
  onPress,
  animate = false,
  delay = 0,
  borderWidth = 1,
  variant = 'card',
  glowColor,
  p,
  px,
  py,
  padding,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const activeTint = tint || (isDark ? 'dark' : 'light');

  // Glass background tints
  const getBackgroundColor = () => {
    if (isDark) {
      switch (variant) {
        case 'elevated':
          return 'rgba(30, 41, 59, 0.72)';
        case 'glow':
          return 'rgba(30, 41, 59, 0.60)';
        case 'subtle':
          return 'rgba(15, 23, 42, 0.40)';
        default:
          return 'rgba(15, 23, 42, 0.62)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.82)';
        case 'glow':
          return 'rgba(255, 255, 255, 0.72)';
        case 'subtle':
          return 'rgba(255, 255, 255, 0.45)';
        default:
          return 'rgba(255, 255, 255, 0.68)';
      }
    }
  };

  // Glass border sheen
  const getBorderColor = () => {
    if (isDark) {
      return variant === 'glow' && glowColor
        ? glowColor
        : 'rgba(255, 255, 255, 0.12)';
    }
    return variant === 'glow' && glowColor
      ? glowColor
      : 'rgba(255, 255, 255, 0.60)';
  };

  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPress();
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth,
    borderColor: getBorderColor(),
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#000000' : '#64748b',
        shadowOffset: { width: 0, height: variant === 'elevated' ? 8 : 4 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: variant === 'elevated' ? 16 : 8,
      },
      android: {
        elevation: variant === 'elevated' ? 4 : 2,
      },
      web: {
        backdropFilter: `blur(${intensity / 4}px)`,
        WebkitBackdropFilter: `blur(${intensity / 4}px)`,
        boxShadow: isDark
          ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          : '0 8px 24px 0 rgba(148, 163, 184, 0.12)',
      } as any,
    }),
    ...style,
  };

  const paddingStyle: ViewStyle = {
    ...(padding !== undefined ? { padding } : {}),
    ...(p !== undefined ? { padding: p } : {}),
    ...(px !== undefined ? { paddingHorizontal: px } : {}),
    ...(py !== undefined ? { paddingVertical: py } : {}),
  };

  const innerContent = (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={intensity}
        tint={activeTint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: getBackgroundColor() },
        ]}
      />
    </View>
  );

  const cardBody = (
    <View style={[styles.content, paddingStyle, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    if (animate) {
      return (
        <MotiView
          from={{ opacity: 0, translateY: 10, scale: 0.98 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220, delay }}
          style={style}
        >
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              containerStyle,
              pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
            ]}
          >
            {innerContent}
            {cardBody}
          </Pressable>
        </MotiView>
      );
    }

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          containerStyle,
          pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
        ]}
      >
        {innerContent}
        {cardBody}
      </Pressable>
    );
  }

  if (animate) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10, scale: 0.98 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220, delay }}
        style={containerStyle}
      >
        {innerContent}
        {cardBody}
      </MotiView>
    );
  }

  return (
    <View style={containerStyle}>
      {innerContent}
      {cardBody}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
