/**
 * TTMM Modern Semantic Colors for Light and Dark themes
 */

const tintColorLight = '#0284c7';
const tintColorDark = '#38bdf8';

export const Colors = {
  light: {
    text: '#0F172A',
    textMuted: '#64748B',
    background: '#F6F8FC',
    surface: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.88)',
    border: 'rgba(226, 232, 240, 0.90)',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    owed: '#16A34A',
    owe: '#E11D48',
  },
  dark: {
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    background: '#0B0F17',
    surface: '#131B2E',
    card: 'rgba(19, 27, 46, 0.82)',
    border: 'rgba(255, 255, 255, 0.10)',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    owed: '#4ADE80',
    owe: '#FB7185',
  },
};

export default Colors;
