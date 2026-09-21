import React, { useState } from 'react';
import { Pressable, KeyboardTypeOptions } from 'react-native';
import { Control, Controller, FieldError, FieldPath, FieldValues } from 'react-hook-form';
import { YStack, XStack, Text, Paragraph, Input } from 'tamagui';
import { AlertCircle, Eye, EyeOff } from '@tamagui/lucide-icons';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';

export interface AuthInputFieldProps<TFieldValues extends FieldValues = any> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  icon: any;
  placeholder: string;
  error?: FieldError;
  isPassword?: boolean;
  accessoryText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  helperText?: string;
}

export function AuthInputField<TFieldValues extends FieldValues = any>({
  name,
  control,
  label,
  icon: IconComponent,
  placeholder,
  error,
  isPassword = false,
  accessoryText,
  keyboardType,
  autoCapitalize = 'none',
  autoComplete,
  helperText,
}: AuthInputFieldProps<TFieldValues>) {
  const isDark = useAppStore((state) => state.isDark);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;

  const borderColor = isFocused
    ? isDark
      ? '#38bdf8'
      : '#0284c7'
    : hasError
    ? isDark
      ? '#fb7185'
      : '#dc2626'
    : isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(226, 232, 240, 0.95)';

  const backgroundColor = isDark
    ? isFocused
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(15, 23, 42, 0.75)'
    : isFocused
    ? '#FFFFFF'
    : 'rgba(248, 250, 252, 0.95)';

  const iconColor = isFocused
    ? isDark
      ? '#38bdf8'
      : '#0284c7'
    : isDark
    ? '#94a3b8'
    : '#64748b';

  return (
    <YStack>
      <XStack justifyContent="space-between" alignItems="center" mb="$1.5">
        <Text fontWeight="700" fontSize="$2" color="$color">
          {label}
        </Text>
        {accessoryText && (
          <Text fontSize={11} color="$gray10" fontWeight="600">
            {accessoryText}
          </Text>
        )}
      </XStack>

      <XStack
        alignItems="center"
        borderWidth={1.5}
        borderColor={borderColor}
        backgroundColor={backgroundColor}
        borderRadius="$4"
        px="$3"
        height={48}
        gap="$2.5"
      >
        <IconComponent size={18} color={iconColor} />

        <Controller
          control={control}
          name={name}
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
              secureTextEntry={isPassword && !showPassword}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              autoComplete={autoComplete}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          )}
        />

        {isPassword && (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setShowPassword((prev) => !prev);
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
        )}
      </XStack>

      {helperText && !hasError && (
        <Paragraph size="$1" color="$gray10" mt="$1" px="$1">
          {helperText}
        </Paragraph>
      )}

      {hasError && (
        <XStack alignItems="center" gap="$1" mt="$1.5" px="$1">
          <AlertCircle size={13} color={isDark ? '#fb7185' : '#dc2626'} />
          <Paragraph
            size="$1"
            color={isDark ? '#fb7185' : '#dc2626'}
            fontWeight="600"
          >
            {error?.message}
          </Paragraph>
        </XStack>
      )}
    </YStack>
  );
}
