import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { MotiView } from 'moti';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AmbientBackgroundProps {
  children?: React.ReactNode;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ children }) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0b1120' : '#f8fafc' }]}>
      {/* Aurora Glow Orb 1 - Cyan / Sky Blue */}
      <MotiView
        from={{ opacity: 0.35, scale: 0.9, translateY: 0 }}
        animate={{ opacity: 0.55, scale: 1.1, translateY: 25 }}
        transition={{
          type: 'timing',
          duration: 7000,
          loop: true,
        }}
        style={[
          styles.orb,
          {
            top: -60,
            left: -40,
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_WIDTH * 0.75,
            backgroundColor: isDark ? '#0369a1' : '#bae6fd',
          },
        ]}
      />

      {/* Aurora Glow Orb 2 - Violet / Indigo */}
      <MotiView
        from={{ opacity: 0.25, scale: 1.05, translateX: 0 }}
        animate={{ opacity: 0.45, scale: 0.9, translateX: -30 }}
        transition={{
          type: 'timing',
          duration: 9000,
          loop: true,
        }}
        style={[
          styles.orb,
          {
            top: SCREEN_HEIGHT * 0.22,
            right: -60,
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            backgroundColor: isDark ? '#4338ca' : '#ddd6fe',
          },
        ]}
      />

      {/* Aurora Glow Orb 3 - Emerald / Mint Accent */}
      <MotiView
        from={{ opacity: 0.2, scale: 0.95 }}
        animate={{ opacity: 0.4, scale: 1.15 }}
        transition={{
          type: 'timing',
          duration: 8000,
          loop: true,
        }}
        style={[
          styles.orb,
          {
            bottom: SCREEN_HEIGHT * 0.1,
            left: -30,
            width: SCREEN_WIDTH * 0.65,
            height: SCREEN_WIDTH * 0.65,
            backgroundColor: isDark ? '#047857' : '#a7f3d0',
          },
        ]}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    ...Platform.select({
      ios: {
        filter: 'blur(60px)',
      },
      android: {
        opacity: 0.2,
      },
      web: {
        filter: 'blur(70px)',
        WebkitFilter: 'blur(70px)',
        pointerEvents: 'none',
      } as any,
    }),
  },
});
