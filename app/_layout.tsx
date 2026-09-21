import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import { tamaguiConfig } from '@/tamagui.config';
import { queryClient } from '@/services/queryClient';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';

// Suppress known upstream deprecation warning from dependencies (expo-router/react-navigation)
// which still reference React Native's deprecated SafeAreaView internally in RN 0.86+
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated and will be removed in a future release',
]);

export default function RootLayout() {
  const isDark = useAppStore((state) => state.isDark);
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, [setCurrentUser]);

  useEffect(() => {
    if (!isAuthReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!currentUser && !inAuthGroup) {
      // User is not logged in but trying to access a protected route
      router.replace('/(auth)/login');
    } else if (currentUser && inAuthGroup) {
      // User is logged in but trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [currentUser, segments, isAuthReady]);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={isDark ? 'dark' : 'light'}>
        <Theme name={isDark ? 'dark' : 'light'}>
          <QueryClientProvider client={queryClient}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor="transparent"
              translucent
            />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: isDark ? '#0B0F17' : '#F6F8FC',
                },
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
    </SafeAreaProvider>
  );
}
