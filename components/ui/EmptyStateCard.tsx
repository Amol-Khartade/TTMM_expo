import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { YStack, Text, Paragraph, Button } from 'tamagui';
import { MotiView } from 'moti';
import { GlassCard } from './GlassCard';
import { useAppStore } from '@/store/useAppStore';

export interface EmptyStateCardProps {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: any;
  onAction?: () => void;
  iconColor?: string;
  iconBg?: string;
  style?: ViewStyle;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  actionIcon: ActionIconComponent,
  onAction,
  iconColor,
  iconBg,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);

  const defaultIconColor = iconColor || (isDark ? '#38bdf8' : '#0284c7');
  const defaultIconBg =
    iconBg || (isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.10)');
  const defaultBorderColor = isDark
    ? 'rgba(56, 189, 248, 0.30)'
    : 'rgba(2, 132, 199, 0.20)';

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18 }}
    >
      <GlassCard variant="card" borderRadius={24} p={28} style={[styles.card, style]}>
        <YStack alignItems="center" justifyContent="center">
          <YStack
            backgroundColor={defaultIconBg}
            width={64}
            height={64}
            borderRadius={22}
            borderWidth={1}
            borderColor={defaultBorderColor}
            alignItems="center"
            justifyContent="center"
            mb="$3"
          >
            <IconComponent size={32} color={defaultIconColor} />
          </YStack>

          <Text fontWeight="800" fontSize="$5" color="$color" textAlign="center">
            {title}
          </Text>

          <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1.5" px="$2">
            {description}
          </Paragraph>

          {actionLabel && onAction && (
            <Button
              mt="$4"
              size="$3"
              borderRadius="$6"
              backgroundColor="$blue10"
              color="white"
              icon={ActionIconComponent ? <ActionIconComponent size={16} color="white" /> : undefined}
              onPress={onAction}
            >
              <Text color="white" fontWeight="700">
                {actionLabel}
              </Text>
            </Button>
          )}
        </YStack>
      </GlassCard>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
