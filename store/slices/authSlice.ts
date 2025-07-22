import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';
import { authService } from '@/services/authService';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.signInWithEmail(email, password);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  }
);

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }, { rejectWithValue }) => {
    try {
      return await authService.signUpWithEmail(email, password, displayName);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign up failed');
    }
  }
);

export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    return await authService.signOut();
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Sign out failed');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Sign in failed';
      })
      .addCase(signUpWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Sign up failed';
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Sign out failed';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Profile update failed';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;