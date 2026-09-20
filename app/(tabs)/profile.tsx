import React from 'react';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, Card, H2, Paragraph, Switch, Separator } from 'tamagui';
import { User, Moon, Shield, LogOut, DollarSign } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';

export default function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const biometricLockEnabled = useAppStore((state) => state.biometricLockEnabled);
  const setBiometricLockEnabled = useAppStore((state) => state.setBiometricLockEnabled);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const handleSignOut = async () => {
    await authService.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      <YStack py="$3">
        <H2 fontWeight="900" color="$color">
          Settings & Profile
        </H2>
        <Paragraph size="$2" color="$gray10">
          Preferences, Security & Account
        </Paragraph>
      </YStack>

      {/* Profile Overview */}
      <Card borderWidth={1} borderColor="#e2e8f0" borderRadius="$5" p="$4" mb="$4">
        <XStack gap="$3" alignItems="center">
          <YStack backgroundColor="$blue5" p="$3" borderRadius="$10">
            <User size={30} color="#0284c7" />
          </YStack>
          <YStack flex={1}>
            <Text fontWeight="800" fontSize="$5">
              {currentUser?.displayName || 'User Profile'}
            </Text>
            <Paragraph size="$2" color="$gray10">
              {currentUser?.email || 'Logged in user'}
            </Paragraph>
          </YStack>
        </XStack>
      </Card>

      {/* Preferences Card */}
      <Card borderWidth={1} borderColor="#e2e8f0" borderRadius="$5" p="$4" mb="$4">
        <Text fontWeight="700" fontSize="$3" color="$gray10" mb="$3" textTransform="uppercase">
          Preferences
        </Text>

        {/* Dark Mode */}
        <XStack justifyContent="space-between" alignItems="center" py="$2">
          <XStack gap="$3" alignItems="center">
            <Moon size={20} color="#64748b" />
            <Text fontWeight="600">Dark Theme</Text>
          </XStack>
          <Switch checked={isDark} onCheckedChange={toggleTheme}>
            <Switch.Thumb />
          </Switch>
        </XStack>

        <Separator my="$2" />

        {/* Biometrics */}
        <XStack justifyContent="space-between" alignItems="center" py="$2">
          <XStack gap="$3" alignItems="center">
            <Shield size={20} color="#64748b" />
            <Text fontWeight="600">Biometric App Lock</Text>
          </XStack>
          <Switch
            checked={biometricLockEnabled}
            onCheckedChange={(val) => setBiometricLockEnabled(val)}
          >
            <Switch.Thumb />
          </Switch>
        </XStack>

        <Separator my="$2" />

        {/* Default Currency */}
        <XStack justifyContent="space-between" alignItems="center" py="$2">
          <XStack gap="$3" alignItems="center">
            <DollarSign size={20} color="#64748b" />
            <Text fontWeight="600">Default Currency</Text>
          </XStack>
          <Text fontWeight="700" color="$blue10">
            {selectedCurrency}
          </Text>
        </XStack>
      </Card>

      {/* Sign Out Button */}
      <Button
        theme="red"
        icon={<LogOut size={18} />}
        onPress={handleSignOut}
        mt="$4"
        size="$4"
      >
        Sign Out
      </Button>
    </YStack>
  );
}
