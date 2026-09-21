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
import { UserPlus, AlertCircle } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signUpSchema, SignUpInput } from '@/schemas/authSchema';
import { authService } from '@/services/authService';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
  const [authError, setAuthError] = React.useState<string | null>(null);

  const onSubmit = async (data: SignUpInput) => {
    try {
      setAuthError(null);
      await authService.signUp(data.email, data.password, data.displayName);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setAuthError(err.message || 'Failed to create account');
    }
  };

  return (
    <YStack flex={1} pt={insets.top} px="$4" justifyContent="center" backgroundColor="$background">
      <YStack mb="$4" alignItems="center">
        <H1 fontWeight="900" fontSize="$7" color="$color">
          Create Account
        </H1>
        <Paragraph size="$2" color="$gray10">
          Join TTMM and split expenses seamlessly
        </Paragraph>
      </YStack>

      <Card borderWidth={1} borderColor="#e2e8f0" borderRadius="$5" p="$4" mb="$4">
        {authError && (
          <XStack
            backgroundColor="#fee2e2"
            p="$3"
            borderRadius="$3"
            alignItems="center"
            gap="$2"
            mb="$3"
          >
            <AlertCircle size={18} color="#dc2626" />
            <Paragraph color="#dc2626" size="$2" flex={1}>
              {authError}
            </Paragraph>
          </XStack>
        )}
        <YStack gap="$2.5">
          <YStack>
            <Text fontWeight="600" mb="$1">
              Full Name
            </Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.displayName && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.displayName.message}
                </Paragraph>
              </XStack>
            )}
          </YStack>

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
              Default UPI ID (Optional)
            </Text>
            <Controller
              control={control}
              name="upiId"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="e.g. name@okhdfcbank"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
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

          <YStack>
            <Text fontWeight="600" mb="$1">
              Confirm Password
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  secureTextEntry
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.confirmPassword && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.confirmPassword.message}
                </Paragraph>
              </XStack>
            )}
          </YStack>

          <Button
            theme="active"
            mt="$3"
            size="$4"
            icon={<UserPlus size={18} />}
            onPress={handleSubmit(onSubmit as any)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </YStack>
      </Card>

      <XStack justifyContent="center" gap="$2" mt="$2">
        <Paragraph color="$gray10">Already have an account?</Paragraph>
        <Text
          fontWeight="700"
          color="$blue10"
          onPress={() => (router.push as any)('/(auth)/login')}
        >
          Sign In
        </Text>
      </XStack>
    </YStack>
  );
}
