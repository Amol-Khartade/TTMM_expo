import React from 'react';
import { YStack, XStack, Text, Button, Card, H2, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { User, UserPlus } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';

export default function FriendsTabScreen() {
  const insets = useSafeAreaInsets();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  // In real app, pulled via TanStack Query for 1-on-1 balances
  const friends: Array<{ id: string; name: string; email: string; netBalance: number }> = [];

  return (
    <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
      <XStack justifyContent="space-between" alignItems="center" py="$3">
        <YStack>
          <H2 fontWeight="900" color="$color">
            Friends
          </H2>
          <Paragraph size="$2" color="$gray10">
            1-on-1 Balances & Direct Splits
          </Paragraph>
        </YStack>
        <Button size="$3" theme="active" icon={<UserPlus size={16} />} borderRadius="$6">
          Add Friend
        </Button>
      </XStack>

      <YStack flex={1}>
        <FlashList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card borderWidth={1} borderColor="#e2e8f0" borderRadius="$5" mb="$3" p="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$3" alignItems="center">
                  <YStack backgroundColor="$gray4" p="$2" borderRadius="$3">
                    <User size={20} color="#64748b" />
                  </YStack>
                  <YStack>
                    <Text fontWeight="700">{item.name}</Text>
                    <Paragraph size="$1" color="$gray10">
                      {item.email}
                    </Paragraph>
                  </YStack>
                </XStack>
                <Text
                  fontWeight="800"
                  color={item.netBalance >= 0 ? '$green10' : '$red10'}
                >
                  {item.netBalance >= 0 ? `+${selectedCurrency} ${item.netBalance}` : `-${selectedCurrency} ${Math.abs(item.netBalance)}`}
                </Text>
              </XStack>
            </Card>
          )}
          ListEmptyComponent={
            <YStack alignItems="center" justifyContent="center" py="$8" px="$4">
              <User size={48} color="#94a3b8" />
              <Text mt="$3" fontWeight="700" fontSize="$5" textAlign="center">
                No direct friends added yet
              </Text>
              <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1">
                Split bills 1-on-1 with anyone without creating a group.
              </Paragraph>
            </YStack>
          }
        />
      </YStack>
    </YStack>
  );
}
