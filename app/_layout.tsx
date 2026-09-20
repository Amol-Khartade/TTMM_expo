import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import tamaguiConfig from '@/tamagui.config';
import { queryClient } from '@/services/queryClient';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';

export default function RootLayout() {
  const isDark = useAppStore((state) => state.isDark);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, [setCurrentUser]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={isDark ? 'dark' : 'light'}>
      <Theme name={isDark ? 'dark' : 'light'}>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="group/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="expense/add"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="settle/[id]"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>
        </QueryClientProvider>
      </Theme>
    </TamaguiProvider>
  );
}
