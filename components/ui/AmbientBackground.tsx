import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useAppStore } from '@/store/useAppStore';

export interface AmbientBackgroundProps {
  children?: React.ReactNode;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ children }) => {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F17' : '#F6F8FC' }]}>
      {/* Smooth Vector Ambient Aurora Glow - Non-blocking, Zero Hard Edges */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            {/* Top Left - Sky / Cyan Glow */}
            <RadialGradient id="auroraTopLeft" cx="15%" cy="8%" rx="55%" ry="45%">
              <Stop
                offset="0%"
                stopColor={isDark ? '#0284c7' : '#38bdf8'}
                stopOpacity={isDark ? 0.22 : 0.16}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#0284c7' : '#38bdf8'}
                stopOpacity={0}
              />
            </RadialGradient>

            {/* Mid Right - Indigo / Violet Glow */}
            <RadialGradient id="auroraMidRight" cx="88%" cy="28%" rx="50%" ry="40%">
              <Stop
                offset="0%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={isDark ? 0.18 : 0.12}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#6366f1' : '#818cf8'}
                stopOpacity={0}
              />
            </RadialGradient>

            {/* Bottom Left - Mint / Emerald Accent */}
            <RadialGradient id="auroraBottomLeft" cx="10%" cy="88%" rx="45%" ry="35%">
              <Stop
                offset="0%"
                stopColor={isDark ? '#10b981' : '#34d399'}
                stopOpacity={isDark ? 0.14 : 0.09}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#10b981' : '#34d399'}
                stopOpacity={0}
              />
            </RadialGradient>
          </Defs>

          <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroraTopLeft)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroraMidRight)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#auroraBottomLeft)" />
        </Svg>
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
