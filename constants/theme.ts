import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EA',
    secondary: '#03DAC6',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    error: '#B00020',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    secondary: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: 'normal' as const },
  body2: { fontSize: 14, fontWeight: 'normal' as const },
  caption: { fontSize: 12, fontWeight: 'normal' as const },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 32,
};

export const elevation = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
};

