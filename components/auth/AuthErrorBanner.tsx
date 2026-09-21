import React from 'react';
import { XStack, Paragraph } from 'tamagui';
import { AlertCircle } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useAppStore } from '@/store/useAppStore';

export interface AuthErrorBannerProps {
  error: string | null;
}

export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({ error }) => {
  const isDark = useAppStore((state) => state.isDark);

  if (!error) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 250 }}
    >
      <XStack
        backgroundColor={
          isDark ? 'rgba(244, 63, 94, 0.16)' : 'rgba(225, 29, 72, 0.10)'
        }
        p="$3"
        borderRadius="$4"
        alignItems="center"
        gap="$2.5"
        mb="$3.5"
        borderWidth={1}
        borderColor={
          isDark ? 'rgba(244, 63, 94, 0.35)' : 'rgba(225, 29, 72, 0.22)'
        }
      >
        <AlertCircle size={18} color={isDark ? '#fb7185' : '#dc2626'} />
        <Paragraph
          color={isDark ? '#fb7185' : '#dc2626'}
          size="$2"
          flex={1}
          fontWeight="600"
        >
          {error}
        </Paragraph>
      </XStack>
    </MotiView>
  );
};
