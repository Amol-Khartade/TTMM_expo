import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Text, H2, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import {
  DollarSign,
  CheckCircle2,
  Receipt,
  UserPlus,
  Clock,
  Filter,
} from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';

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
      amount: `${selectedCurrency} 2,450.00`,
    },
    {
      id: '2',
      title: 'Settled with Rahul',
      detail: 'Paid via UPI in Goa Trip 2026',
      timeAgo: '1d ago',
      type: 'settlement',
      amount: `${selectedCurrency} 450.00`,
    },
    {
      id: '3',
      title: 'Uber to Airport',
      detail: 'Added in Weekend Getaway',
      timeAgo: '2d ago',
      type: 'expense',
      amount: `${selectedCurrency} 820.00`,
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
        return { icon: Receipt, bg: '#e0f2fe', color: '#0284c7' };
      case 'settlement':
        return { icon: CheckCircle2, bg: '#dcfce7', color: '#16a34a' };
      case 'member':
        return { icon: UserPlus, bg: '#ede9fe', color: '#7c3aed' };
      default:
        return { icon: Clock, bg: '#f1f5f9', color: '#64748b' };
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

        {/* Filter Pills */}
        <XStack gap="$2" my="$3">
          {(['all', 'expense', 'settlement'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const label = filter === 'all' ? 'All Activity' : filter === 'expense' ? 'Expenses' : 'Settlements';

            return (
              <Pressable
                key={filter}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveFilter(filter);
                }}
                style={[
                  styles.filterPill,
                  isActive
                    ? styles.filterPillActive
                    : isDark
                    ? styles.filterPillInactiveDark
                    : styles.filterPillInactiveLight,
                ]}
              >
                <Text
                  fontSize="$2"
                  fontWeight={isActive ? '800' : '600'}
                  color={isActive ? 'white' : '$gray10'}
                >
                  {label}
                </Text>
              </Pressable>
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
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 18 }}
              >
                <GlassCard variant="card" borderRadius={24} p={28} style={styles.emptyCard}>
                  <YStack alignItems="center" justifyContent="center">
                    <YStack
                      backgroundColor={isDark ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe'}
                      width={64}
                      height={64}
                      borderRadius={22}
                      alignItems="center"
                      justifyContent="center"
                      mb="$3"
                    >
                      <Clock size={32} color="#0284c7" />
                    </YStack>
                    <Text fontWeight="800" fontSize="$5" color="$color" textAlign="center">
                      No activity recorded
                    </Text>
                    <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1.5" px="$3">
                      New expenses, settlements, and member joins will appear here in real time.
                    </Paragraph>
                  </YStack>
                </GlassCard>
              </MotiView>
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
  emptyCard: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: '#0284c7',
  },
  filterPillInactiveLight: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  filterPillInactiveDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
