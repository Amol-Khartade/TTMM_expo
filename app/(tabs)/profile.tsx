import React from 'react';
import { StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, XStack, Text, Button, H2, Paragraph, Switch, Separator } from 'tamagui';
import {
  User,
  Moon,
  Shield,
  LogOut,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ChevronRight,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const biometricLockEnabled = useAppStore((state) => state.biometricLockEnabled);
  const setBiometricLockEnabled = useAppStore((state) => state.setBiometricLockEnabled);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of TTMM?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              await authService.signOut();
            } catch (error) {
              console.warn('Sign out error:', error);
            } finally {
              setCurrentUser(null);
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  const initials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ME';

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        <YStack py="$2.5">
          <H2 fontWeight="900" color="$color" letterSpacing={-0.5} fontSize="$7">
            Profile & Settings
          </H2>
          <Paragraph size="$2" color="$gray10" mt="$-1">
            Manage account, security, and app preferences
          </Paragraph>
        </YStack>

        <YStack flex={1} mt="$2" gap="$3.5">
          {/* User Profile Hero Card */}
          <MotiView
            from={{ opacity: 0, translateY: -8, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <GlassCard variant="elevated" borderRadius={24} p={18}>
              <XStack gap="$3.5" alignItems="center">
                <YStack
                  width={56}
                  height={56}
                  borderRadius={20}
                  backgroundColor={isDark ? 'rgba(56, 189, 248, 0.2)' : '#e0f2fe'}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderColor={isDark ? 'rgba(56, 189, 248, 0.4)' : '#bae6fd'}
                >
                  <Text fontSize={20} fontWeight="900" color="#0284c7">
                    {initials}
                  </Text>
                </YStack>

                <YStack flex={1}>
                  <XStack alignItems="center" gap="$2">
                    <Text fontWeight="800" fontSize="$5" color="$color" numberOfLines={1}>
                      {currentUser?.displayName || 'TTMM Member'}
                    </Text>
                    <CheckCircle2 size={16} color="#16a34a" />
                  </XStack>
                  <Paragraph size="$2" color="$gray10" numberOfLines={1} mt="$0.5">
                    {currentUser?.email || 'user@ttmm.app'}
                  </Paragraph>
                  <XStack
                    backgroundColor={isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'}
                    px="$2"
                    py="$0.5"
                    borderRadius="$3"
                    alignSelf="flex-start"
                    mt="$1.5"
                  >
                    <Text fontSize={10} fontWeight="800" color="#0284c7" textTransform="uppercase">
                      Free Unlimited Tier
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
            </GlassCard>
          </MotiView>

          {/* Preferences Card */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 60 }}
          >
            <GlassCard variant="card" borderRadius={22} p={16}>
              <Text
                fontWeight="800"
                fontSize="$2"
                color="$gray10"
                mb="$3"
                textTransform="uppercase"
                letterSpacing={0.8}
              >
                Preferences
              </Text>

              {/* Dark Theme */}
              <XStack justifyContent="space-between" alignItems="center" py="$2">
                <XStack gap="$3" alignItems="center">
                  <YStack
                    backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : '$gray4'}
                    p="$2"
                    borderRadius="$3"
                  >
                    <Moon size={18} color="#64748b" />
                  </YStack>
                  <YStack>
                    <Text fontWeight="700" fontSize="$3" color="$color">
                      Dark Theme
                    </Text>
                    <Paragraph size="$1" color="$gray10">
                      Switch between glass dark & light modes
                    </Paragraph>
                  </YStack>
                </XStack>
                <Switch
                  checked={isDark}
                  onCheckedChange={() => {
                    Haptics.selectionAsync().catch(() => {});
                    toggleTheme();
                  }}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>

              <Separator my="$2" borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />

              {/* Biometrics */}
              <XStack justifyContent="space-between" alignItems="center" py="$2">
                <XStack gap="$3" alignItems="center">
                  <YStack
                    backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : '$gray4'}
                    p="$2"
                    borderRadius="$3"
                  >
                    <Shield size={18} color="#64748b" />
                  </YStack>
                  <YStack>
                    <Text fontWeight="700" fontSize="$3" color="$color">
                      Biometric App Lock
                    </Text>
                    <Paragraph size="$1" color="$gray10">
                      Require Face ID / Fingerprint on launch
                    </Paragraph>
                  </YStack>
                </XStack>
                <Switch
                  checked={biometricLockEnabled}
                  onCheckedChange={(val) => {
                    Haptics.selectionAsync().catch(() => {});
                    setBiometricLockEnabled(val);
                  }}
                >
                  <Switch.Thumb />
                </Switch>
              </XStack>

              <Separator my="$2" borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />

              {/* Currency */}
              <XStack justifyContent="space-between" alignItems="center" py="$2">
                <XStack gap="$3" alignItems="center">
                  <YStack
                    backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : '$gray4'}
                    p="$2"
                    borderRadius="$3"
                  >
                    <DollarSign size={18} color="#64748b" />
                  </YStack>
                  <YStack>
                    <Text fontWeight="700" fontSize="$3" color="$color">
                      Default Currency
                    </Text>
                    <Paragraph size="$1" color="$gray10">
                      Standard denomination for balances
                    </Paragraph>
                  </YStack>
                </XStack>
                <XStack
                  backgroundColor={isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'}
                  px="$3"
                  py="$1"
                  borderRadius="$4"
                >
                  <Text fontWeight="800" color="#0284c7" fontSize="$3">
                    {selectedCurrency}
                  </Text>
                </XStack>
              </XStack>
            </GlassCard>
          </MotiView>

          {/* App Info Card */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 100 }}
          >
            <GlassCard variant="card" borderRadius={22} p={16}>
              <Text
                fontWeight="800"
                fontSize="$2"
                color="$gray10"
                mb="$3"
                textTransform="uppercase"
                letterSpacing={0.8}
              >
                App Details
              </Text>

              <XStack justifyContent="space-between" alignItems="center" py="$1">
                <XStack gap="$2.5" alignItems="center">
                  <Smartphone size={16} color="#64748b" />
                  <Text fontWeight="600" fontSize="$3" color="$color">
                    TTMM Version
                  </Text>
                </XStack>
                <Text fontSize="$2" color="$gray10" fontWeight="700">
                  v1.0.0 (SDK 56)
                </Text>
              </XStack>

              <Separator my="$2" borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />

              <XStack justifyContent="space-between" alignItems="center" py="$1">
                <XStack gap="$2.5" alignItems="center">
                  <Sparkles size={16} color="#0284c7" />
                  <Text fontWeight="600" fontSize="$3" color="$color">
                    Cloud Database
                  </Text>
                </XStack>
                <Text fontSize="$2" color="#16a34a" fontWeight="700">
                  Synced Online
                </Text>
              </XStack>
            </GlassCard>
          </MotiView>

          {/* Sign Out Action Button */}
          <MotiView
            from={{ opacity: 0, translateY: 6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 18, delay: 140 }}
          >
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
            >
              <LogOut size={18} color="#ef4444" />
              <Text color="#ef4444" fontWeight="800" fontSize="$3">
                Sign Out
              </Text>
            </Pressable>
          </MotiView>
        </YStack>
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginTop: 4,
  },
});
