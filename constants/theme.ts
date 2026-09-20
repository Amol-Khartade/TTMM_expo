export const lightTheme = {
  colors: {
    primary: '#0284c7',
    secondary: '#10b981',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    error: '#EF4444',
  },
};

export const darkTheme = {
  colors: {
    primary: '#38bdf8',
    secondary: '#34d399',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    error: '#F87171',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: 'normal' as const },
  body2: { fontSize: 14, fontWeight: 'normal' as const },
  caption: { fontSize: 12, fontWeight: 'normal' as const },
};