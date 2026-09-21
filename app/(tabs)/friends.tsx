import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Text, Button, H2, Paragraph, Dialog, Input } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { User, UserPlus, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { GlassCard } from '@/components/ui/GlassCard';

interface FriendItem {
  id: string;
  name: string;
  email: string;
  netBalance: number;
}

export default function FriendsTabScreen() {
  const insets = useSafeAreaInsets();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);

  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');

  // 1-on-1 direct friends ledger
  const friends: FriendItem[] = [];

  const handleAddFriend = () => {
    if (!friendEmail.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFriendEmail('');
    setAddFriendOpen(false);
  };

  const renderFriendItem = ({ item, index }: { item: FriendItem; index: number }) => {
    const initials = item.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <GlassCard
        key={item.id}
        variant="card"
        borderRadius={20}
        p={14}
        animate
        delay={index * 50}
        style={styles.cardMargin}
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <YStack
              backgroundColor={isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.10)'}
              width={44}
              height={44}
              borderRadius={14}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={isDark ? 'rgba(56, 189, 248, 0.30)' : 'rgba(2, 132, 199, 0.20)'}
            >
              <Text fontSize={14} fontWeight="800" color={isDark ? '#38bdf8' : '#0284c7'}>
                {initials}
              </Text>
            </YStack>
            <YStack flex={1}>
              <Text fontWeight="800" fontSize="$4" color="$color">
                {item.name}
              </Text>
              <Paragraph size="$1" color="$gray10" numberOfLines={1}>
                {item.email}
              </Paragraph>
            </YStack>
          </XStack>

          <YStack alignItems="flex-end">
            {item.netBalance > 0.01 ? (
              <XStack alignItems="center" gap="$1">
                <ArrowUpRight size={14} color="#16a34a" />
                <Text fontWeight="900" fontSize="$4" color="#16a34a">
                  +{selectedCurrency} {item.netBalance.toFixed(2)}
                </Text>
              </XStack>
            ) : item.netBalance < -0.01 ? (
              <XStack alignItems="center" gap="$1">
                <ArrowDownLeft size={14} color="#e11d48" />
                <Text fontWeight="900" fontSize="$4" color="#e11d48">
                  -{selectedCurrency} {Math.abs(item.netBalance).toFixed(2)}
                </Text>
              </XStack>
            ) : (
              <XStack alignItems="center" gap="$1">
                <CheckCircle2 size={14} color="#16a34a" />
                <Text fontWeight="700" fontSize="$2" color="$gray10">
                  Settled
                </Text>
              </XStack>
            )}
          </YStack>
        </XStack>
      </GlassCard>
    );
  };

  return (
    <AmbientBackground>
      <YStack flex={1} pt={insets.top} px="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" py="$2.5">
          <YStack>
            <H2 fontWeight="900" color="$color" letterSpacing={-0.5} fontSize="$7">
              Friends
            </H2>
            <Paragraph size="$2" color="$gray10" mt="$-1">
              1-on-1 Balances & Direct Splits
            </Paragraph>
          </YStack>
          <Button
            size="$3"
            borderRadius="$6"
            backgroundColor="$blue10"
            color="white"
            icon={<UserPlus size={16} color="white" />}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setAddFriendOpen(true);
            }}
            pressStyle={{ opacity: 0.85, scale: 0.96 }}
          >
            <Text color="white" fontWeight="700" fontSize="$2">
              Add Friend
            </Text>
          </Button>
        </XStack>

        <YStack flex={1} mt="$2">
          <FlashList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriendItem}
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
                      backgroundColor={isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.10)'}
                      width={64}
                      height={64}
                      borderRadius={22}
                      borderWidth={1}
                      borderColor={isDark ? 'rgba(56, 189, 248, 0.30)' : 'rgba(2, 132, 199, 0.20)'}
                      alignItems="center"
                      justifyContent="center"
                      mb="$3"
                    >
                      <User size={32} color={isDark ? '#38bdf8' : '#0284c7'} />
                    </YStack>
                    <Text mt="$1" fontWeight="800" fontSize="$5" color="$color" textAlign="center">
                      No direct friends added yet
                    </Text>
                    <Paragraph size="$2" color="$gray10" textAlign="center" mt="$1.5" px="$3">
                      Split restaurant checks, rides, and gifts 1-on-1 with anyone without creating a group.
                    </Paragraph>
                    <Button
                      mt="$4"
                      size="$3"
                      borderRadius="$6"
                      backgroundColor="$blue10"
                      color="white"
                      icon={<UserPlus size={16} color="white" />}
                      onPress={() => setAddFriendOpen(true)}
                    >
                      Add First Friend
                    </Button>
                  </YStack>
                </GlassCard>
              </MotiView>
            }
          />
        </YStack>

        {/* Add Friend Dialog */}
        <Dialog open={addFriendOpen} onOpenChange={setAddFriendOpen}>
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              opacity={0.65}
              backgroundColor="rgba(0,0,0,0.6)"
            />
            <Dialog.Content
              key="content"
              p="$4"
              width="90%"
              borderRadius={24}
              backgroundColor={isDark ? '#131B2E' : '#ffffff'}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.10)' : 'rgba(226, 232, 240, 0.90)'}
              elevation={8}
            >
              <Dialog.Title fontWeight="800" fontSize="$5" color="$color">
                Add Friend
              </Dialog.Title>
              <Dialog.Description size="$2" color="$gray10" mb="$3.5">
                Enter your friend&apos;s registered email to link your accounts.
              </Dialog.Description>

              <Input
                placeholder="friend@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={friendEmail}
                onChangeText={setFriendEmail}
                mb="$4"
                borderRadius="$4"
                borderWidth={1}
                borderColor={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.90)'}
                backgroundColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.95)'}
                color="$color"
              />

              <XStack justifyContent="flex-end" gap="$2.5">
                <Button
                  chromeless
                  borderRadius="$4"
                  onPress={() => setAddFriendOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="$blue10"
                  color="white"
                  borderRadius="$4"
                  onPress={handleAddFriend}
                  disabled={!friendEmail.trim()}
                >
                  <Text color="white" fontWeight="700">
                    Add
                  </Text>
                </Button>
              </XStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
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
});
