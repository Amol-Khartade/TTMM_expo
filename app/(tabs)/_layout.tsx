import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Users, User, Clock, Settings } from '@tamagui/lucide-icons';
import { useAppStore } from '@/store/useAppStore';

export default function TabLayout() {
  const isDark = useAppStore((state) => state.isDark);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: isDark ? '#38bdf8' : '#0284c7',
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 66,
          borderRadius: 30,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.90)',
          backgroundColor:
            Platform.OS === 'android'
              ? isDark
                ? '#131B2E'
                : '#FFFFFF'
              : isDark
              ? 'rgba(19, 27, 46, 0.85)'
              : 'rgba(255, 255, 255, 0.90)',
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: isDark ? '#000000' : '#0f172a',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.45 : 0.08,
              shadowRadius: 18,
            },
            android: {
              elevation: 8,
            },
            web: {
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                : '0 8px 25px rgba(15, 23, 42, 0.08)',
            } as any,
          }),
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={65}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, focused }) => (
            <Users color={color as any} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <User color={color as any} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <Clock color={color as any} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Settings color={color as any} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
