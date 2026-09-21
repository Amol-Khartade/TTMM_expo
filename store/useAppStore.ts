import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV, MMKV } from 'react-native-mmkv';
import { User } from '@/types';
import { ENV } from '@/constants';

// Synchronous MMKV Storage with in-memory fallback for Web/test runners
let mmkvInstance: MMKV | null = null;
try {
  mmkvInstance = createMMKV({ id: 'ttmm-app-storage' });
} catch {
  // Fallback for web or non-native environments
}

const memoryFallback = new Map<string, string>();

export const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    if (mmkvInstance) {
      mmkvInstance.set(name, value);
    } else {
      memoryFallback.set(name, value);
    }
  },
  getItem: (name: string) => {
    if (mmkvInstance) {
      return mmkvInstance.getString(name) ?? null;
    }
    return memoryFallback.get(name) ?? null;
  },
  removeItem: (name: string) => {
    if (mmkvInstance) {
      mmkvInstance.remove(name);
    } else {
      memoryFallback.delete(name);
    }
  },
};

export interface AppUIState {
  // Client UI State
  isDark: boolean;
  activeGroupId: string | null;
  selectedCurrency: string;
  biometricLockEnabled: boolean;
  currentUser: User | null;

  // Actions
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  setActiveGroup: (groupId: string | null) => void;
  setSelectedCurrency: (currency: string) => void;
  setBiometricLockEnabled: (enabled: boolean) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAppStore = create<AppUIState>()(
  persist(
    (set) => ({
      isDark: false,
      activeGroupId: null,
      selectedCurrency: ENV.DEFAULTS.CURRENCY,
      biometricLockEnabled: false,
      currentUser: null,

      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (isDark: boolean) => set({ isDark }),
      setActiveGroup: (groupId) => set({ activeGroupId: groupId }),
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      setBiometricLockEnabled: (enabled) => set({ biometricLockEnabled: enabled }),
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: 'ttmm-client-ui-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
