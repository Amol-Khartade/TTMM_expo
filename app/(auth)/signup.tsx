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
import {
  UserPlus,
  Mail,
  Lock,
  User,
  QrCode,
  Sun,
  Moon,
  ArrowLeft,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { signUpSchema, SignUpInput } from '@/schemas/authSchema';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';
import {
  AnimatedAuthBackground,
  GlassCard,
  AuthInputField,
  AuthErrorBanner,
  AuthSubmitButton,
} from '@/components';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema) as any,
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      upiId: '',
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      setAuthError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      await authService.signUp(data.email, data.password, data.displayName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Sign up error:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setAuthError(err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleToggleTheme = () => {
    Haptics.selectionAsync().catch(() => {});
    toggleTheme();
  };

  const handleBackToLogin = () => {
    Haptics.selectionAsync().catch(() => {});
    router.replace('/(auth)/login');
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
          <XStack justifyContent="space-between" alignItems="center" mb="$3" px="$2">
            <Pressable
              onPress={handleBackToLogin}
              style={({ pressed }) => [
                styles.navButton,
                {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.90)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(226, 232, 240, 0.95)',
                },
                pressed && { transform: [{ scale: 0.92 }], opacity: 0.85 },
              ]}
              accessibilityLabel="Back to sign in"
              accessibilityRole="button"
            >
              <ArrowLeft size={18} color={isDark ? '#e2e8f0' : '#1e293b'} />
            </Pressable>

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
                Join Free
              </Text>
            </XStack>

            {/* Theme Toggle Button */}
            <Pressable
              onPress={handleToggleTheme}
              style={({ pressed }) => [
                styles.navButton,
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

          {/* Hero Section */}
          <MotiView
            from={{ opacity: 0, translateY: -14, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 18, delay: 80 }}
          >
            <YStack alignItems="center" mb="$4">
              <YStack
                width={58}
                height={58}
                borderRadius={20}
                backgroundColor={isDark ? 'rgba(56, 189, 248, 0.16)' : 'rgba(2, 132, 199, 0.10)'}
                borderWidth={1.5}
                borderColor={isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.22)'}
                alignItems="center"
                justifyContent="center"
                mb="$2.5"
                shadowColor={isDark ? '#38bdf8' : '#0284c7'}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={isDark ? 0.3 : 0.15}
                shadowRadius={12}
              >
                <UserPlus size={26} color={isDark ? '#38bdf8' : '#0284c7'} />
              </YStack>

              <Text
                fontWeight="900"
                fontSize={28}
                color="$color"
                letterSpacing={-0.6}
                textAlign="center"
              >
                Create Account
              </Text>

              <Paragraph
                size="$2"
                color="$gray10"
                textAlign="center"
                mt="$1"
                maxWidth={290}
              >
                Start splitting bills, dinners, and trips with zero stress.
              </Paragraph>
            </YStack>
          </MotiView>

          {/* Form Card */}
          <MotiView
            from={{ opacity: 0, translateY: 24, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, delay: 160 }}
          >
            <GlassCard variant="elevated" borderRadius={26} p={20}>
              {/* Form Level Error Banner (DRY Component) */}
              <AuthErrorBanner error={authError} />

              <YStack gap="$3">
                {/* Full Name */}
                <AuthInputField
                  name="displayName"
                  control={control}
                  label="Full Name"
                  icon={User}
                  placeholder="e.g. Rahul Sharma"
                  error={errors.displayName}
                  autoCapitalize="words"
                  autoComplete="name"
                />

                {/* Email Address */}
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

                {/* Default UPI ID (Optional) */}
                <AuthInputField
                  name="upiId"
                  control={control}
                  label="Default UPI ID"
                  accessoryText="Optional"
                  icon={QrCode}
                  placeholder="e.g. yourname@okhdfcbank"
                  error={errors.upiId}
                  helperText="Used for instant 1-tap settlements in groups"
                />

                {/* Password */}
                <AuthInputField
                  name="password"
                  control={control}
                  label="Password"
                  icon={Lock}
                  placeholder="At least 6 characters"
                  error={errors.password}
                  isPassword
                />

                {/* Confirm Password */}
                <AuthInputField
                  name="confirmPassword"
                  control={control}
                  label="Confirm Password"
                  icon={Lock}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                  isPassword
                />

                {/* Submit Primary CTA Button (DRY Component) */}
                <AuthSubmitButton
                  isSubmitting={isSubmitting}
                  label="Create Account"
                  loadingLabel="Creating Account..."
                  onPress={handleSubmit(onSubmit as any)}
                  accessibilityLabel="Create account button"
                />

                <Paragraph
                  size="$1"
                  color="$gray10"
                  textAlign="center"
                  mt="$2"
                  px="$2"
                >
                  By joining, you agree to TTMM&apos;s Terms &amp; Privacy Policy.
                </Paragraph>
              </YStack>
            </GlassCard>
          </MotiView>

          {/* Switch to Sign In */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 240 }}
          >
            <XStack justifyContent="center" alignItems="center" gap="$2" mt="$4" py="$2">
              <Paragraph color="$gray10" size="$2">
                Already have an account?
              </Paragraph>
              <Pressable
                onPress={handleBackToLogin}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Navigate to sign in screen"
              >
                <Text
                  fontWeight="800"
                  color={isDark ? '#38bdf8' : '#0284c7'}
                  fontSize="$2"
                >
                  Sign In
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
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
