import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, H2, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  CheckCircle2,
  Receipt,
  UserPlus,
  Clock,
} from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { FilterPill } from '@/components/ui/FilterPill';
import { EmptyStateCard } from '@/components/ui/EmptyStateCard';
import { formatCurrency } from '@/utils/formatters';

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  type: 'expense' | 'settlement' | 'member';
  amount?: string;
}

export default function ActivityTabScreen() {
  const insets = useSafeAreaInsets();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);

  const [activeFilter, setActiveFilter] = useState<'all' | 'expense' | 'settlement'>('all');

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Dinner at Social',
      detail: 'Added in Goa Trip 2026 by You',
      timeAgo: '2h ago',
      type: 'expense',
      amount: formatCurrency(2450, selectedCurrency),
    },
    {
      id: '2',
      title: 'Settled with Rahul',
      detail: 'Paid via UPI in Goa Trip 2026',
      timeAgo: '1d ago',
      type: 'settlement',
      amount: formatCurrency(450, selectedCurrency),
    },
    {
      id: '3',
      title: 'Uber to Airport',
      detail: 'Added in Weekend Getaway',
      timeAgo: '2d ago',
      type: 'expense',
      amount: formatCurrency(820, selectedCurrency),
    },
    {
      id: '4',
      title: 'Rahul joined Goa Trip 2026',
      detail: 'Added via email invite',
      timeAgo: '3d ago',
      type: 'member',
    },
  ];

  const filteredActivities = mockActivities.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getActivityMeta = (type: ActivityItem['type']) => {
    switch (type) {
      case 'expense':
        return {
          icon: Receipt,
          bg: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.10)',
          color: isDark ? '#38bdf8' : '#0284c7',
        };
      case 'settlement':
        return {
          icon: CheckCircle2,
          bg: isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(22, 163, 74, 0.10)',
          color: isDark ? '#34d399' : '#16a34a',
        };
      case 'member':
        return {
          icon: UserPlus,
          bg: isDark ? 'rgba(167, 139, 250, 0.18)' : 'rgba(124, 58, 237, 0.10)',
          color: isDark ? '#a78bfa' : '#7c3aed',
        };
      default:
        return {
          icon: Clock,
          bg: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.10)',
          color: isDark ? '#94a3b8' : '#64748b',
        };
    }
  };

  const renderActivityItem = ({ item, index }: { item: ActivityItem; index: number }) => {
    const { icon: IconComponent, bg, color } = getActivityMeta(item.type);

    return (
      <GlassCard
        key={item.id}
        variant="card"
        borderRadius={20}
        p={14}
        animate
        delay={index * 45}
        style={styles.cardMargin}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack
              backgroundColor={bg}
              width={44}
              height={44}
              borderRadius={14}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'}
              alignItems="center"
              justifyContent="center"
            >
              <IconComponent size={20} color={color} />
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="800" fontSize="$4" color="$color">
                {item.title}
              </Text>
              <Paragraph size="$1" color="$gray10" numberOfLines={1} mt="$0.5">
                {item.detail}
              </Paragraph>
            </YStack>
          </XStack>

          <YStack alignItems="flex-end" ml="$2">
            {item.amount && (
              <Text fontWeight="800" fontSize="$4" color="$color">
                {item.amount}
              </Text>
            )}
            <XStack alignItems="center" gap="$1" mt="$1">
              <Clock size={11} color="#94a3b8" />
              <Paragraph size="$1" color="$gray9">
                {item.timeAgo}
              </Paragraph>
            </XStack>
          </YStack>
        </XStack>
      </GlassCard>
    );
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Header */}
        <YStack py="$2.5">
          <H2 fontWeight="900" color="$color" letterSpacing={-0.5} fontSize="$7">
            Recent Activity
          </H2>
          <Paragraph size="$2" color="$gray10" mt="$-1">
            Real-time chronological audit trail of all group transactions
          </Paragraph>
        </YStack>

        {/* Filter Pills (DRY Component) */}
        <XStack gap="$2" my="$3">
          {(['all', 'expense', 'settlement'] as const).map((filter) => {
            const label =
              filter === 'all'
                ? 'All Activity'
                : filter === 'expense'
                ? 'Expenses'
                : 'Settlements';

            return (
              <FilterPill
                key={filter}
                label={label}
                active={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            );
          })}
        </XStack>

        <YStack flex={1}>
          <FlashList
            data={filteredActivities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivityItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
            ListEmptyComponent={
              <EmptyStateCard
                icon={Clock}
                title="No activity recorded"
                description="New expenses, settlements, and member joins will appear here in real time."
              />
            }
          />
        </YStack>
      </YStack>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  cardMargin: {
    marginBottom: 10,
  },
});
