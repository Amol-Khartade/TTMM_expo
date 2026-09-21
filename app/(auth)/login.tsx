import React from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H1,
  Paragraph,
  Input,
} from 'tamagui';
import { LogIn, AlertCircle } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginSchema, LoginInput } from '@/schemas/authSchema';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store/useAppStore';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useAppStore((state) => state.isDark);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [authError, setAuthError] = React.useState<string | null>(null);

  const onSubmit = async (data: LoginInput) => {
    try {
      setAuthError(null);
      await authService.signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Failed to sign in');
    }
  };

  return (
    <YStack flex={1} pt={insets.top} px="$4" justifyContent="center" backgroundColor="$background">
      <YStack mb="$6" alignItems="center">
        <H1 fontWeight="900" fontSize="$8" color="$color">
          TTMM
        </H1>
        <Paragraph size="$3" color="$gray10">
          Tera Tu Mera Mai • Splitwise Alternative
        </Paragraph>
      </YStack>

      <Card
        borderWidth={1}
        borderColor={isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.90)'}
        backgroundColor={isDark ? '#131B2E' : '#FFFFFF'}
        borderRadius="$5"
        p="$4"
        mb="$4"
      >
        {authError && (
          <XStack
            backgroundColor={isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.10)'}
            p="$3"
            borderRadius="$3"
            alignItems="center"
            gap="$2"
            mb="$3"
            borderWidth={1}
            borderColor={isDark ? 'rgba(244, 63, 94, 0.30)' : 'rgba(225, 29, 72, 0.22)'}
          >
            <AlertCircle size={18} color={isDark ? '#fb7185' : '#dc2626'} />
            <Paragraph color={isDark ? '#fb7185' : '#dc2626'} size="$2" flex={1}>
              {authError}
            </Paragraph>
          </XStack>
        )}
        <YStack gap="$3">
          <YStack>
            <Text fontWeight="600" mb="$1">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@example.com"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.email.message}
                </Paragraph>
              </XStack>
            )}
          </YStack>

          <YStack>
            <Text fontWeight="600" mb="$1">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  secureTextEntry
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.password && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.password.message}
                </Paragraph>
              </XStack>
            )}
          </YStack>

          <Button
            theme="active"
            mt="$3"
            size="$4"
            icon={<LogIn size={18} />}
            onPress={handleSubmit(onSubmit as any)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </YStack>
      </Card>

      <XStack justifyContent="center" gap="$2" mt="$2">
        <Paragraph color="$gray10">Don&apos;t have an account?</Paragraph>
        <Text
          fontWeight="700"
          color="$blue10"
          onPress={() => (router.push as any)('/(auth)/signup')}
        >
          Sign Up
        </Text>
      </XStack>
    </YStack>
  );
}
