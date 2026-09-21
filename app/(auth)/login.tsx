import React, { useState } from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { YStack, XStack, Text, Paragraph } from 'tamagui';
import { Mail, Lock, Sparkles, Sun, Moon } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { loginSchema, LoginInput } from '@/schemas/authSchema';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';
import {
  AnimatedAuthBackground,
  GlassCard,
  AuthInputField,
  AuthErrorBanner,
  AuthSubmitButton,
} from '@/components';
import { ENV } from '@/constants';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setAuthError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      await authService.signIn(data.email, data.password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setAuthError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleToggleTheme = () => {
    Haptics.selectionAsync().catch(() => {});
    toggleTheme();
  };

  const handleDemoFill = () => {
    Haptics.selectionAsync().catch(() => {});
    setValue('email', 'demo@ttmm.app', { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <AnimatedAuthBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 8, 24),
              paddingBottom: Math.max(insets.bottom + 20, 32),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Quick Action Bar */}
          <XStack justifyContent="space-between" alignItems="center" mb="$4" px="$2">
            <XStack
              alignItems="center"
              gap="$1.5"
              px="$2.5"
              py="$1"
              borderRadius="$4"
              backgroundColor={isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)'}
              borderWidth={1}
              borderColor={isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.18)'}
            >
              <YStack
                width={6}
                height={6}
                borderRadius={3}
                backgroundColor={isDark ? '#38bdf8' : '#0284c7'}
              />
              <Text
                fontSize={11}
                fontWeight="800"
                color={isDark ? '#38bdf8' : '#0284c7'}
                letterSpacing={0.5}
                textTransform="uppercase"
              >
                Smart Splitwise
              </Text>
            </XStack>

            {/* Theme Toggle Button */}
            <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => [
                styles.themeButton,
                {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.90)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(226, 232, 240, 0.95)',
                },
                pressed && { transform: [{ scale: 0.92 }], opacity: 0.85 },
              ]}
              accessibilityLabel="Toggle Dark and Light theme"
              accessibilityRole="button"
            >
              {isDark ? <Sun size={18} color="#facc15" /> : <Moon size={18} color="#64748b" />}
            </Pressable>
          </XStack>

          {/* Hero Branding */}
          <MotiView
            from={{ opacity: 0, translateY: -16, scale: 0.94 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 18, delay: 100 }}
          >
            <YStack alignItems="center" mb="$5">
              {/* App Icon Monogram Badge */}
              <YStack
                width={64}
                height={64}
                borderRadius={22}
                backgroundColor={isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.10)'}
                borderWidth={1.5}
                borderColor={isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.22)'}
                alignItems="center"
                justifyContent="center"
                mb="$3"
                shadowColor={isDark ? '#38bdf8' : '#0284c7'}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={isDark ? 0.3 : 0.15}
                shadowRadius={12}
              >
                <Sparkles size={30} color={isDark ? '#38bdf8' : '#0284c7'} />
              </YStack>

              <Text
                fontWeight="900"
                fontSize={32}
                color="$color"
                letterSpacing={-0.8}
                textAlign="center"
              >
                {ENV.APP_NAME}
              </Text>

              <XStack
                backgroundColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}
                px="$2.5"
                py="$0.5"
                borderRadius="$3"
                mt="$1"
                borderWidth={1}
                borderColor={isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)'}
              >
                <Text
                  fontSize={12}
                  fontWeight="800"
                  color={isDark ? '#94a3b8' : '#64748b'}
                  letterSpacing={0.4}
                >
                  Tera Tu Mera Mai
                </Text>
              </XStack>

              <Paragraph
                size="$2"
                color="$gray10"
                textAlign="center"
                mt="$1.5"
                maxWidth={280}
              >
                Split expenses, track balances &amp; settle up fairly with friends.
              </Paragraph>
            </YStack>
          </MotiView>

          {/* Login Form Elevated Glass Card */}
          <MotiView
            from={{ opacity: 0, translateY: 24, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 180 }}
          >
            <GlassCard variant="elevated" borderRadius={26} p={22}>
              <YStack mb="$4">
                <Text fontWeight="800" fontSize="$6" color="$color" letterSpacing={-0.3}>
                  Welcome Back
                </Text>
                <Paragraph size="$1" color="$gray10" mt="$0.5">
                  Sign in to continue to your shared groups
                </Paragraph>
              </YStack>

              {/* Form Error Banner (DRY Component) */}
              <AuthErrorBanner error={authError} />

              <YStack gap="$3.5">
                {/* Email Input Field (DRY Component) */}
                <AuthInputField
                  name="email"
                  control={control}
                  label="Email Address"
                  icon={Mail}
                  placeholder="name@example.com"
                  error={errors.email}
                  keyboardType="email-address"
                  autoComplete="email"
                />

                {/* Password Input Field (DRY Component) */}
                <AuthInputField
                  name="password"
                  control={control}
                  label="Password"
                  icon={Lock}
                  placeholder="Enter your password"
                  error={errors.password}
                  isPassword
                />

                {/* Submit Primary CTA Button (DRY Component) */}
                <AuthSubmitButton
                  isSubmitting={isSubmitting}
                  label="Sign In"
                  loadingLabel="Signing In..."
                  onPress={handleSubmit(onSubmit as any)}
                  accessibilityLabel="Sign in button"
                />

                {/* Quick Demo Autofill Helper */}
                <XStack justifyContent="center" alignItems="center" mt="$1">
                  <Pressable
                    onPress={handleDemoFill}
                    style={({ pressed }) => [
                      styles.demoButton,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.04)',
                        borderColor: isDark
                          ? 'rgba(255, 255, 255, 0.10)'
                          : 'rgba(0, 0, 0, 0.08)',
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      fontSize={11}
                      fontWeight="700"
                      color={isDark ? '#94a3b8' : '#64748b'}
                    >
                      🧪 Tap to Auto-fill Demo Account
                    </Text>
                  </Pressable>
                </XStack>
              </YStack>
            </GlassCard>
          </MotiView>

          {/* Switch to Sign Up */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 260 }}
          >
            <XStack justifyContent="center" alignItems="center" gap="$2" mt="$5" py="$2">
              <Paragraph color="$gray10" size="$2">
                Don&apos;t have an account yet?
              </Paragraph>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push('/(auth)/signup');
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Navigate to sign up screen"
              >
                <Text
                  fontWeight="800"
                  color={isDark ? '#38bdf8' : '#0284c7'}
                  fontSize="$2"
                >
                  Create Account
                </Text>
              </Pressable>
            </XStack>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedAuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  demoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
});
