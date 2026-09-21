import React from 'react';
import { YStack, Text } from 'tamagui';
import { getInitials } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

export interface UserAvatarProps {
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isCurrentUser?: boolean;
}

const SIZE_CONFIG = {
  xs: { box: 28, radius: 14, fontSize: 11, border: 1 },
  sm: { box: 34, radius: 17, fontSize: 12, border: 1 },
  md: { box: 44, radius: 14, fontSize: 14, border: 1 },
  lg: { box: 56, radius: 20, fontSize: 20, border: 1.5 },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  isCurrentUser = false,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const cfg = SIZE_CONFIG[size];
  const initials = getInitials(name, isCurrentUser ? 'ME' : '??');

  const bg = isCurrentUser
    ? isDark
      ? 'rgba(56, 189, 248, 0.18)'
      : 'rgba(2, 132, 199, 0.10)'
    : isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.04)';

  const borderColor = isCurrentUser
    ? isDark
      ? 'rgba(56, 189, 248, 0.35)'
      : 'rgba(2, 132, 199, 0.20)'
    : isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(226, 232, 240, 0.85)';

  const textColor = isCurrentUser
    ? isDark
      ? '#38bdf8'
      : '#0284c7'
    : isDark
    ? '#cbd5e1'
    : '$gray11';

  return (
    <YStack
      width={cfg.box}
      height={cfg.box}
      borderRadius={cfg.radius}
      backgroundColor={bg}
      borderWidth={cfg.border}
      borderColor={borderColor}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={cfg.fontSize} fontWeight="800" color={textColor}>
        {initials}
      </Text>
    </YStack>
  );
};
