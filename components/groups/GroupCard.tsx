import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text, Paragraph } from 'tamagui';
import { Users, ChevronRight } from '@tamagui/lucide-icons';
import { Group } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

const GROUP_PALETTES = [
  { bg: '#e0f2fe', iconBg: '#0284c7', text: '#0369a1', glow: 'rgba(2, 132, 199, 0.25)' }, // Sky
  { bg: '#ede9fe', iconBg: '#7c3aed', text: '#6d28d9', glow: 'rgba(124, 58, 237, 0.25)' }, // Purple
  { bg: '#dcfce7', iconBg: '#16a34a', text: '#15803d', glow: 'rgba(22, 163, 74, 0.25)' },  // Emerald
  { bg: '#fef3c7', iconBg: '#d97706', text: '#b45309', glow: 'rgba(217, 119, 6, 0.25)' },  // Amber
  { bg: '#ffe4e6', iconBg: '#e11d48', text: '#be123c', glow: 'rgba(225, 29, 72, 0.25)' },  // Rose
  { bg: '#ccfbf1', iconBg: '#0d9488', text: '#0f766e', glow: 'rgba(13, 148, 136, 0.25)' }, // Teal
];

export const getGroupPalette = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GROUP_PALETTES.length;
  return GROUP_PALETTES[index];
};

export interface GroupCardProps {
  group: Group;
  index?: number;
  onPress: () => void;
  style?: ViewStyle;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  index = 0,
  onPress,
  style,
}) => {
  const isDark = useAppStore((state) => state.isDark);
  const theme = getGroupPalette(group.name);

  return (
    <GlassCard
      variant="card"
      borderRadius={20}
      p={14}
      animate
      delay={index * 55}
      style={[styles.card, style]}
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3" alignItems="center" flex={1}>
          <YStack
            backgroundColor={theme.bg}
            width={46}
            height={46}
            borderRadius={14}
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor={theme.glow}
          >
            <Users size={22} color={theme.iconBg} />
          </YStack>
          <YStack flex={1}>
            <Text fontWeight="800" fontSize="$4" numberOfLines={1} color="$color">
              {group.name}
            </Text>
            <XStack alignItems="center" gap="$1.5" mt="$0.5">
              <Text fontSize={12} color="$gray10">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </Text>
              {group.description ? (
                <>
                  <Text fontSize={10} color="$gray8">
                    •
                  </Text>
                  <Text fontSize={12} color="$gray10" numberOfLines={1} flex={1}>
                    {group.description}
                  </Text>
                </>
              ) : null}
            </XStack>
          </YStack>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <YStack
            backgroundColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
            p="$1.5"
            borderRadius="$3"
          >
            <ChevronRight size={18} color="#94a3b8" />
          </YStack>
        </XStack>
      </XStack>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
});
