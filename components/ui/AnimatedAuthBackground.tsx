import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { MotiView } from 'moti';
import { useAppStore } from '@/store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AnimatedAuthBackgroundProps {
  children?: React.ReactNode;
}

export const AnimatedAuthBackground: React.FC<AnimatedAuthBackgroundProps> = ({ children }) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F17' : '#F6F8FC' }]}>
      {/* Animated Ambient Aurora Glow Orbs Layer (Non-interactive) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Orb 1: Cyan / Sky (Top Left drifting across) */}
        <MotiView
          from={{ translateX: -25, translateY: -20, scale: 0.94 }}
          animate={{ translateX: 30, translateY: 35, scale: 1.16 }}
          transition={{
            type: 'timing',
            duration: 8000,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.orbContainer,
            {
              top: -60,
              left: -40,
              width: 380,
              height: 380,
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 380 380">
            <Defs>
              <RadialGradient id="authCyanGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop
                  offset="0%"
                  stopColor={isDark ? '#0284c7' : '#38bdf8'}
                  stopOpacity={isDark ? 0.36 : 0.22}
                />
                <Stop
                  offset="45%"
                  stopColor={isDark ? '#0284c7' : '#38bdf8'}
                  stopOpacity={isDark ? 0.16 : 0.08}
                />
                <Stop
                  offset="100%"
                  stopColor={isDark ? '#0284c7' : '#38bdf8'}
                  stopOpacity={0}
                />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="380" height="380" fill="url(#authCyanGlow)" />
          </Svg>
        </MotiView>

        {/* Orb 2: Electric Violet / Indigo (Top Right to Mid) */}
        <MotiView
          from={{ translateX: 25, translateY: 20, scale: 1.14 }}
          animate={{ translateX: -35, translateY: -25, scale: 0.88 }}
          transition={{
            type: 'timing',
            duration: 10500,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.orbContainer,
            {
              top: SCREEN_HEIGHT * 0.18,
              right: -60,
              width: 360,
              height: 360,
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 360 360">
            <Defs>
              <RadialGradient id="authVioletGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop
                  offset="0%"
                  stopColor={isDark ? '#6366f1' : '#818cf8'}
                  stopOpacity={isDark ? 0.30 : 0.18}
                />
                <Stop
                  offset="50%"
                  stopColor={isDark ? '#6366f1' : '#818cf8'}
                  stopOpacity={isDark ? 0.12 : 0.06}
                />
                <Stop
                  offset="100%"
                  stopColor={isDark ? '#6366f1' : '#818cf8'}
                  stopOpacity={0}
                />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="360" height="360" fill="url(#authVioletGlow)" />
          </Svg>
        </MotiView>

        {/* Orb 3: Mint / Emerald (Bottom Anchor) */}
        <MotiView
          from={{ translateX: -20, translateY: 25, scale: 0.92 }}
          animate={{ translateX: 28, translateY: -30, scale: 1.12 }}
          transition={{
            type: 'timing',
            duration: 11500,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.orbContainer,
            {
              bottom: -50,
              left: SCREEN_WIDTH * 0.1,
              width: 360,
              height: 360,
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 360 360">
            <Defs>
              <RadialGradient id="authMintGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop
                  offset="0%"
                  stopColor={isDark ? '#10b981' : '#34d399'}
                  stopOpacity={isDark ? 0.24 : 0.14}
                />
                <Stop
                  offset="50%"
                  stopColor={isDark ? '#10b981' : '#34d399'}
                  stopOpacity={isDark ? 0.09 : 0.04}
                />
                <Stop
                  offset="100%"
                  stopColor={isDark ? '#10b981' : '#34d399'}
                  stopOpacity={0}
                />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="360" height="360" fill="url(#authMintGlow)" />
          </Svg>
        </MotiView>

        {/* Floating Micro-Particles & Sparkles (Atmospheric Depth) */}
        {/* Particle 1: Sparkle top left */}
        <MotiView
          from={{ translateY: 0, opacity: 0.25, scale: 0.85 }}
          animate={{ translateY: -22, opacity: 0.85, scale: 1.2 }}
          transition={{
            type: 'timing',
            duration: 4200,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.particle,
            {
              top: SCREEN_HEIGHT * 0.14,
              left: 48,
            },
          ]}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path
              d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
              fill={isDark ? '#38bdf8' : '#0284c7'}
            />
          </Svg>
        </MotiView>

        {/* Particle 2: Glowing Dot mid-right */}
        <MotiView
          from={{ translateY: 0, opacity: 0.2, scale: 0.9 }}
          animate={{ translateY: -28, opacity: 0.8, scale: 1.25 }}
          transition={{
            type: 'timing',
            duration: 5400,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.particle,
            {
              top: SCREEN_HEIGHT * 0.28,
              right: 44,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isDark ? '#818cf8' : '#6366f1',
              shadowColor: isDark ? '#818cf8' : '#6366f1',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
            },
          ]}
        />

        {/* Particle 3: Sparkle mid-left */}
        <MotiView
          from={{ translateY: 0, opacity: 0.3, scale: 0.8 }}
          animate={{ translateY: -24, opacity: 0.9, scale: 1.15 }}
          transition={{
            type: 'timing',
            duration: 4800,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.particle,
            {
              top: SCREEN_HEIGHT * 0.62,
              left: 32,
            },
          ]}
        >
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
              fill={isDark ? '#34d399' : '#10b981'}
            />
          </Svg>
        </MotiView>

        {/* Particle 4: Soft Ring right */}
        <MotiView
          from={{ translateY: 0, opacity: 0.2 }}
          animate={{ translateY: -30, opacity: 0.75 }}
          transition={{
            type: 'timing',
            duration: 6000,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.particle,
            {
              top: SCREEN_HEIGHT * 0.72,
              right: 52,
            },
          ]}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16">
            <Circle
              cx="8"
              cy="8"
              r="6"
              stroke={isDark ? '#a78bfa' : '#818cf8'}
              strokeWidth="1.5"
              fill="none"
              opacity={0.7}
            />
          </Svg>
        </MotiView>

        {/* Particle 5: Tiny Dot bottom center */}
        <MotiView
          from={{ translateY: 0, opacity: 0.25 }}
          animate={{ translateY: -20, opacity: 0.85 }}
          transition={{
            type: 'timing',
            duration: 5100,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            styles.particle,
            {
              bottom: SCREEN_HEIGHT * 0.12,
              left: SCREEN_WIDTH * 0.45,
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: isDark ? '#38bdf8' : '#0ea5e9',
            },
          ]}
        />
      </View>

      {/* Foreground Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  orbContainer: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
