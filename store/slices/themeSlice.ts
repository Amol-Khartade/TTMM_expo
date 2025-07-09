import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeState } from '@/types';
import { lightTheme, darkTheme } from '@/constants/theme';

const initialState: ThemeState = {
  isDark: false,
  colors: lightTheme.colors,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      state.colors = state.isDark ? darkTheme.colors : lightTheme.colors;
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      state.colors = action.payload ? darkTheme.colors : lightTheme.colors;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;