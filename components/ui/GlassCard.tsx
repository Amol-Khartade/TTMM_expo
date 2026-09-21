import React from 'react';
import {
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
  Pressable,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
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
  intensity = 50,
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

  // Modern glass & card background colors
  const getBackgroundColor = () => {
    if (isDark) {
      switch (variant) {
        case 'elevated':
          return Platform.OS === 'android' ? '#1B253D' : 'rgba(27, 37, 61, 0.88)';
        case 'glow':
          return Platform.OS === 'android' ? '#172136' : 'rgba(23, 33, 54, 0.82)';
        case 'subtle':
          return Platform.OS === 'android' ? '#101726' : 'rgba(16, 23, 38, 0.65)';
        default:
          return Platform.OS === 'android' ? '#131B2E' : 'rgba(19, 27, 46, 0.82)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)';
        case 'glow':
          return Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.90)';
        case 'subtle':
          return Platform.OS === 'android' ? '#F8FAFC' : 'rgba(248, 250, 252, 0.82)';
        default:
          return Platform.OS === 'android' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.88)';
      }
    }
  };

  // Modern border sheen - avoiding stark white borders in light mode
  const getBorderColor = () => {
    if (variant === 'glow' && glowColor) {
      return glowColor;
    }
    if (isDark) {
      switch (variant) {
        case 'elevated':
          return 'rgba(255, 255, 255, 0.12)';
        case 'subtle':
          return 'rgba(255, 255, 255, 0.06)';
        default:
          return 'rgba(255, 255, 255, 0.09)';
      }
    } else {
      switch (variant) {
        case 'elevated':
          return 'rgba(226, 232, 240, 0.95)';
        case 'subtle':
          return 'rgba(226, 232, 240, 0.60)';
        default:
          return 'rgba(226, 232, 240, 0.85)';
      }
    }
  };

  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPress();
    }
  };

  const baseContainerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth,
    borderColor: getBorderColor(),
    backgroundColor: Platform.OS === 'android' ? getBackgroundColor() : 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: isDark ? '#000000' : '#0f172a',
        shadowOffset: { width: 0, height: variant === 'elevated' ? 6 : 3 },
        shadowOpacity: isDark ? 0.35 : 0.06,
        shadowRadius: variant === 'elevated' ? 14 : 7,
      },
      android: {
        elevation: variant === 'elevated' ? 4 : 2,
      },
      web: {
        backdropFilter: `blur(${Math.round(intensity / 3)}px)`,
        WebkitBackdropFilter: `blur(${Math.round(intensity / 3)}px)`,
        backgroundColor: getBackgroundColor(),
        boxShadow: isDark
          ? '0 8px 28px 0 rgba(0, 0, 0, 0.40)'
          : '0 6px 20px 0 rgba(15, 23, 42, 0.05)',
      } as any,
    }),
  };

  const paddingStyle: ViewStyle = {
    ...(padding !== undefined ? { padding } : {}),
    ...(p !== undefined ? { padding: p } : {}),
    ...(px !== undefined ? { paddingHorizontal: px } : {}),
    ...(py !== undefined ? { paddingVertical: py } : {}),
  };

  // Only render BlurView on iOS where it is natively hardware-accelerated and smooth.
  // On Android and Web, BlurView without native target leads to white box fallbacks.
  const innerContent = (
    <View style={StyleSheet.absoluteFill}>
      {Platform.OS === 'ios' ? (
        <>
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
        </>
      ) : Platform.OS === 'web' ? null : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: getBackgroundColor() },
          ]}
        />
      )}
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
              baseContainerStyle,
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
          baseContainerStyle,
          style,
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
        style={[baseContainerStyle, style]}
      >
        {innerContent}
        {cardBody}
      </MotiView>
    );
  }

  return (
    <View style={[baseContainerStyle, style]}>
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
