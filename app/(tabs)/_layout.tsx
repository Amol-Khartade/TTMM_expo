import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { Users, User, Clock, Settings } from '@tamagui/lucide-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background?.get() || '#ffffff',
          borderTopColor: theme.borderColor?.get() || '#e2e8f0',
        },
        tabBarActiveTintColor: theme.color?.get() || '#0284c7',
        tabBarInactiveTintColor: theme.colorHover?.get() || '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => <Users color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => <User color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Clock color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Settings color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
