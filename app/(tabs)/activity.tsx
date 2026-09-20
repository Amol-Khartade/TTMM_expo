import React from 'react';
import { YStack, XStack, Text, Card, H2, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { DollarSign, CheckCircle2 } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  type: 'expense' | 'settlement';
}

export default function ActivityTabScreen() {
  const insets = useSafeAreaInsets();

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'Dinner at Social',
      detail: 'Added in Goa Trip 2026',
      timeAgo: '2h ago',
      type: 'expense',
    },
    {
      id: '2',
      title: 'Settled ₹450 with Rahul',
      detail: 'Paid via UPI',
      timeAgo: '1d ago',
      type: 'settlement',
    },
  ];

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      <YStack py="$3">
        <H2 fontWeight="900" color="$color">
          Recent Activity
        </H2>
        <Paragraph size="$2" color="$gray10">
          Chronological audit trail of all group transactions
        </Paragraph>
      </YStack>

      <YStack flex={1}>
        <FlashList
          data={mockActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card borderWidth={1} borderColor="#e2e8f0" borderRadius="$5" mb="$3" p="$3">
              <XStack gap="$3" alignItems="center">
                <YStack
                  backgroundColor={item.type === 'expense' ? '$blue4' : '$green4'}
                  p="$2"
                  borderRadius="$4"
                >
                  {item.type === 'expense' ? (
                    <DollarSign size={20} color="#0284c7" />
                  ) : (
                    <CheckCircle2 size={20} color="#16a34a" />
                  )}
                </YStack>
                <YStack flex={1}>
                  <Text fontWeight="700">{item.title}</Text>
                  <Paragraph size="$2" color="$gray10">
                    {item.detail}
                  </Paragraph>
                </YStack>
                <Paragraph size="$1" color="$gray9">
                  {item.timeAgo}
                </Paragraph>
              </XStack>
            </Card>
          )}
        />
      </YStack>
    </YStack>
  );
}
