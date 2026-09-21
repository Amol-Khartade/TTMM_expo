import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { Users, ChevronRight } from '@tamagui/lucide-icons';
import { Group } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

const GROUP_PALETTES = [
  // Sky
  {
    lightBg: 'rgba(2, 132, 199, 0.12)',
    darkBg: 'rgba(56, 189, 248, 0.18)',
    lightIcon: '#0284c7',
    darkIcon: '#38bdf8',
    glow: 'rgba(2, 132, 199, 0.25)',
  },
  // Purple
  {
    lightBg: 'rgba(124, 58, 237, 0.12)',
    darkBg: 'rgba(167, 139, 250, 0.18)',
    lightIcon: '#7c3aed',
    darkIcon: '#a78bfa',
    glow: 'rgba(124, 58, 237, 0.25)',
  },
  // Emerald
  {
    lightBg: 'rgba(16, 185, 129, 0.12)',
    darkBg: 'rgba(52, 211, 153, 0.18)',
    lightIcon: '#16a34a',
    darkIcon: '#34d399',
    glow: 'rgba(22, 163, 74, 0.25)',
  },
  // Amber
  {
    lightBg: 'rgba(245, 158, 11, 0.12)',
    darkBg: 'rgba(251, 191, 36, 0.18)',
    lightIcon: '#d97706',
    darkIcon: '#fbbf24',
    glow: 'rgba(217, 119, 6, 0.25)',
  },
  // Rose
  {
    lightBg: 'rgba(225, 29, 72, 0.12)',
    darkBg: 'rgba(251, 113, 133, 0.18)',
    lightIcon: '#e11d48',
    darkIcon: '#fb7185',
    glow: 'rgba(225, 29, 72, 0.25)',
  },
  // Teal
  {
    lightBg: 'rgba(20, 184, 166, 0.12)',
    darkBg: 'rgba(45, 212, 191, 0.18)',
    lightIcon: '#0d9488',
    darkIcon: '#2dd4bf',
    glow: 'rgba(13, 148, 136, 0.25)',
  },
];

export const getGroupPalette = (name: string, isDark: boolean = false) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GROUP_PALETTES.length;
  const p = GROUP_PALETTES[index];
  return {
    bg: isDark ? p.darkBg : p.lightBg,
    iconBg: isDark ? p.darkIcon : p.lightIcon,
    glow: p.glow,
  };
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
  const theme = getGroupPalette(group.name, isDark);

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
