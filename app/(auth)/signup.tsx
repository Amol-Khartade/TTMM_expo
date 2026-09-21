import React, { useState } from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  YStack,
  XStack,
  Text,
  Paragraph,
  Input,
} from 'tamagui';
import {
  UserPlus,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  QrCode,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { signUpSchema, SignUpInput } from '@/schemas/authSchema';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';
import { AnimatedAuthBackground, GlassCard } from '@/components';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

  const getInputBorderStyle = (fieldName: keyof SignUpInput) => {
    const isFocused = focusedField === fieldName;
    const hasError = !!errors[fieldName];

    if (isFocused) {
      return isDark ? '#38bdf8' : '#0284c7';
    }
    if (hasError) {
      return isDark ? '#fb7185' : '#dc2626';
    }
    return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.95)';
  };

  const getInputBgStyle = (fieldName: keyof SignUpInput) => {
    const isFocused = focusedField === fieldName;
    if (isDark) {
      return isFocused ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)';
    }
    return isFocused ? '#FFFFFF' : 'rgba(248, 250, 252, 0.95)';
  };

  const getIconColor = (fieldName: keyof SignUpInput) => {
    if (focusedField === fieldName) {
      return isDark ? '#38bdf8' : '#0284c7';
    }
    return isDark ? '#94a3b8' : '#64748b';
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
              {/* Form Level Error Banner */}
              {authError && (
                <MotiView
                  from={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 250 }}
                >
                  <XStack
                    backgroundColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.10)'}
                    p="$3"
                    borderRadius="$4"
                    alignItems="center"
                    gap="$2.5"
                    mb="$3.5"
                    borderWidth={1}
                    borderColor={isDark ? 'rgba(244, 63, 94, 0.35)' : 'rgba(225, 29, 72, 0.22)'}
                  >
                    <AlertCircle size={18} color={isDark ? '#fb7185' : '#dc2626'} />
                    <Paragraph color={isDark ? '#fb7185' : '#dc2626'} size="$2" flex={1} fontWeight="600">
                      {authError}
                    </Paragraph>
                  </XStack>
                </MotiView>
              )}

              <YStack gap="$3">
                {/* Full Name */}
                <YStack>
                  <Text fontWeight="700" fontSize="$2" color="$color" mb="$1.5">
                    Full Name
                  </Text>
                  <XStack
                    alignItems="center"
                    borderWidth={1.5}
                    borderColor={getInputBorderStyle('displayName')}
                    backgroundColor={getInputBgStyle('displayName')}
                    borderRadius="$4"
                    px="$3"
                    height={48}
                    gap="$2.5"
                  >
                    <User size={18} color={getIconColor('displayName')} />
                    <Controller
                      control={control}
                      name="displayName"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          flex={1}
                          height={44}
                          borderWidth={0}
                          backgroundColor="transparent"
                          padding={0}
                          color="$color"
                          placeholderTextColor="$gray10"
                          fontSize="$3"
                          autoCapitalize="words"
                          autoComplete="name"
                          placeholder="e.g. Rahul Sharma"
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('displayName')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                    />
                  </XStack>
                  {errors.displayName && (
                    <XStack alignItems="center" gap="$1" mt="$1.5" px="$1">
                      <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
                      <Paragraph size="$1" color={isDark ? '#fb7185' : '#dc2626'} fontWeight="600">
                        {errors.displayName.message}
                      </Paragraph>
                    </XStack>
                  )}
                </YStack>

                {/* Email Address */}
                <YStack>
                  <Text fontWeight="700" fontSize="$2" color="$color" mb="$1.5">
                    Email Address
                  </Text>
                  <XStack
                    alignItems="center"
                    borderWidth={1.5}
                    borderColor={getInputBorderStyle('email')}
                    backgroundColor={getInputBgStyle('email')}
                    borderRadius="$4"
                    px="$3"
                    height={48}
                    gap="$2.5"
                  >
                    <Mail size={18} color={getIconColor('email')} />
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          flex={1}
                          height={44}
                          borderWidth={0}
                          backgroundColor="transparent"
                          padding={0}
                          color="$color"
                          placeholderTextColor="$gray10"
                          fontSize="$3"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="email"
                          placeholder="name@example.com"
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                    />
                  </XStack>
                  {errors.email && (
                    <XStack alignItems="center" gap="$1" mt="$1.5" px="$1">
                      <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
                      <Paragraph size="$1" color={isDark ? '#fb7185' : '#dc2626'} fontWeight="600">
                        {errors.email.message}
                      </Paragraph>
                    </XStack>
                  )}
                </YStack>

                {/* Default UPI ID (Optional) */}
                <YStack>
                  <XStack justifyContent="space-between" alignItems="center" mb="$1.5">
                    <Text fontWeight="700" fontSize="$2" color="$color">
                      Default UPI ID
                    </Text>
                    <Text fontSize={11} color="$gray10" fontWeight="600">
                      Optional
                    </Text>
                  </XStack>
                  <XStack
                    alignItems="center"
                    borderWidth={1.5}
                    borderColor={getInputBorderStyle('upiId')}
                    backgroundColor={getInputBgStyle('upiId')}
                    borderRadius="$4"
                    px="$3"
                    height={48}
                    gap="$2.5"
                  >
                    <QrCode size={18} color={getIconColor('upiId')} />
                    <Controller
                      control={control}
                      name="upiId"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          flex={1}
                          height={44}
                          borderWidth={0}
                          backgroundColor="transparent"
                          padding={0}
                          color="$color"
                          placeholderTextColor="$gray10"
                          fontSize="$3"
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholder="e.g. yourname@okhdfcbank"
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('upiId')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                    />
                  </XStack>
                  <Paragraph size="$1" color="$gray10" mt="$1" px="$1">
                    Used for instant 1-tap settlements in groups
                  </Paragraph>
                  {errors.upiId && (
                    <XStack alignItems="center" gap="$1" mt="$1" px="$1">
                      <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
                      <Paragraph size="$1" color={isDark ? '#fb7185' : '#dc2626'} fontWeight="600">
                        {errors.upiId.message}
                      </Paragraph>
                    </XStack>
                  )}
                </YStack>

                {/* Password */}
                <YStack>
                  <Text fontWeight="700" fontSize="$2" color="$color" mb="$1.5">
                    Password
                  </Text>
                  <XStack
                    alignItems="center"
                    borderWidth={1.5}
                    borderColor={getInputBorderStyle('password')}
                    backgroundColor={getInputBgStyle('password')}
                    borderRadius="$4"
                    px="$3"
                    height={48}
                    gap="$2.5"
                  >
                    <Lock size={18} color={getIconColor('password')} />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          flex={1}
                          height={44}
                          borderWidth={0}
                          backgroundColor="transparent"
                          padding={0}
                          color="$color"
                          placeholderTextColor="$gray10"
                          fontSize="$3"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholder="At least 6 characters"
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                    />
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setShowPassword(!showPassword);
                      }}
                      hitSlop={10}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                      ) : (
                        <Eye size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                      )}
                    </Pressable>
                  </XStack>
                  {errors.password && (
                    <XStack alignItems="center" gap="$1" mt="$1.5" px="$1">
                      <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
                      <Paragraph size="$1" color={isDark ? '#fb7185' : '#dc2626'} fontWeight="600">
                        {errors.password.message}
                      </Paragraph>
                    </XStack>
                  )}
                </YStack>

                {/* Confirm Password */}
                <YStack>
                  <Text fontWeight="700" fontSize="$2" color="$color" mb="$1.5">
                    Confirm Password
                  </Text>
                  <XStack
                    alignItems="center"
                    borderWidth={1.5}
                    borderColor={getInputBorderStyle('confirmPassword')}
                    backgroundColor={getInputBgStyle('confirmPassword')}
                    borderRadius="$4"
                    px="$3"
                    height={48}
                    gap="$2.5"
                  >
                    <Lock size={18} color={getIconColor('confirmPassword')} />
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, value } }) => (
                        <Input
                          flex={1}
                          height={44}
                          borderWidth={0}
                          backgroundColor="transparent"
                          padding={0}
                          color="$color"
                          placeholderTextColor="$gray10"
                          fontSize="$3"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholder="Re-enter password"
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                      )}
                    />
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      hitSlop={10}
                      accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      accessibilityRole="button"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                      ) : (
                        <Eye size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                      )}
                    </Pressable>
                  </XStack>
                  {errors.confirmPassword && (
                    <XStack alignItems="center" gap="$1" mt="$1.5" px="$1">
                      <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
                      <Paragraph size="$1" color={isDark ? '#fb7185' : '#dc2626'} fontWeight="600">
                        {errors.confirmPassword.message}
                      </Paragraph>
                    </XStack>
                  )}
                </YStack>

                {/* Submit Primary CTA Button */}
                <Pressable
                  onPress={handleSubmit(onSubmit as any)}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: isDark ? '#38bdf8' : '#0284c7',
                      shadowColor: isDark ? '#38bdf8' : '#0284c7',
                    },
                    pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                    isSubmitting && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Create account button"
                >
                  {isSubmitting ? (
                    <XStack alignItems="center" gap="$2">
                      <ActivityIndicator size="small" color={isDark ? '#0B0F17' : '#FFFFFF'} />
                      <Text
                        fontWeight="800"
                        fontSize="$3"
                        color={isDark ? '#0B0F17' : '#FFFFFF'}
                      >
                        Creating Account...
                      </Text>
                    </XStack>
                  ) : (
                    <XStack alignItems="center" gap="$2">
                      <Text
                        fontWeight="800"
                        fontSize="$3"
                        color={isDark ? '#0B0F17' : '#FFFFFF'}
                      >
                        Create Account
                      </Text>
                      <ArrowRight size={18} color={isDark ? '#0B0F17' : '#FFFFFF'} />
                    </XStack>
                  )}
                </Pressable>

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
  primaryButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
});
