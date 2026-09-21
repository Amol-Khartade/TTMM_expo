import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  YStack,
  XStack,
  Text,
  Button,
  H2,
  Paragraph,
  Input,
  Separator,
} from 'tamagui';
import { X, Check, AlertCircle, Sparkles } from '@tamagui/lucide-icons';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { createExpenseSchema, CreateExpenseInput } from '@/schemas/expenseSchema';
import { useAddExpenseMutation } from '@/queries/useExpenses';
import { useGroupDetailsQuery, useUserGroupsQuery } from '@/queries/useGroups';
import { useAppStore } from '@/store/useAppStore';
import { ENV } from '@/constants';
import {
  AmbientBackground,
  GlassCard,
  CategorySelector,
  SplitTypeSelector,
  UserAvatar,
  FilterPill,
  ReceiptScannerModal,
  ReceiptBadgeCard,
} from '@/components';
import { ParsedReceipt } from '@/services/receiptScannerService';
import { formatCurrency } from '@/utils/formatters';

export default function AddExpenseModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { groupId, scan } = useLocalSearchParams<{ groupId?: string; scan?: string }>();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isDark = useAppStore((state) => state.isDark);

  const [selectedGroupId] = useState(groupId || '');
  const [scannerOpen, setScannerOpen] = useState(scan === 'true');
  const [scannedReceipt, setScannedReceipt] = useState<ParsedReceipt | null>(null);

  const { data: userGroups = [] } = useUserGroupsQuery(currentUser?.id);
  const { data: activeGroup } = useGroupDetailsQuery(selectedGroupId || userGroups[0]?.id);

  const addExpenseMutation = useAddExpenseMutation();
  const members = useMemo(() => activeGroup?.members || [], [activeGroup?.members]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      title: '',
      amount: 0,
      currency: selectedCurrency || ENV.DEFAULTS.CURRENCY,
      groupId: selectedGroupId || userGroups[0]?.id || '',
      paidBy: currentUser?.id || '',
      category: 'food',
      splitType: 'equal',
      splits: [],
      date: new Date(),
    },
  });

  const watchAmount = watch('amount');
  const watchSplitType = watch('splitType');
  const watchSplits = watch('splits');
  const watchCategory = watch('category');
  const watchPaidBy = watch('paidBy');

  // Auto-calculate splits when amount, splitType, or group members change
  useEffect(() => {
    if (!members.length || watchAmount <= 0) return;

    if (watchSplitType === 'equal') {
      const splitAmount = Math.round((watchAmount / members.length) * 100) / 100;
      const initialSplits = members.map((m) => ({
        userId: m.userId,
        amount: splitAmount,
      }));
      setValue('splits', initialSplits);
    }
  }, [watchAmount, watchSplitType, members, setValue]);

  // Set default paidBy when currentUser is available
  useEffect(() => {
    if (currentUser?.id && !watchPaidBy) {
      setValue('paidBy', currentUser.id);
    }
  }, [currentUser?.id, watchPaidBy, setValue]);

  const handleReceiptParsed = (receipt: ParsedReceipt) => {
    setScannedReceipt(receipt);
    setValue('title', receipt.title, { shouldValidate: true, shouldDirty: true });
    setValue('amount', receipt.amount, { shouldValidate: true, shouldDirty: true });
    setValue('category', receipt.category as any, { shouldValidate: true, shouldDirty: true });
    if (receipt.date) {
      setValue('date', receipt.date, { shouldValidate: true, shouldDirty: true });
    }
    let noteText = receipt.notes || '';
    if (receipt.paymentDetails?.isPaymentScreenshot) {
      const parts: string[] = [];
      if (receipt.paymentDetails.appNameFormatted) {
        parts.push(`Paid via ${receipt.paymentDetails.appNameFormatted}`);
      }
      if (receipt.paymentDetails.receiverUpiId) {
        parts.push(`To: ${receipt.paymentDetails.receiverUpiId}`);
      }
      if (receipt.paymentDetails.utrNumber) {
        parts.push(`UTR: ${receipt.paymentDetails.utrNumber}`);
      }
      noteText = parts.length > 0 ? parts.join(' • ') : noteText;
    }
    if (noteText) {
      setValue('notes', noteText, { shouldDirty: true });
    }
  };

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await addExpenseMutation.mutateAsync({
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        groupId: data.groupId,
        paidBy: data.paidBy,
        category: data.category,
        splitType: data.splitType as any,
        splitDetails: data.splits,
        date: data.date,
        createdBy: currentUser?.id || 'anonymous',
      });
      router.back();
    } catch (err: any) {
      console.error('Failed to add expense:', err);
    }
  };

  return (
    <AmbientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack flex={1} pt={insets.top} px="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" py="$2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.back();
              }}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: isDark ? 'rgba(27, 37, 61, 0.85)' : 'rgba(255, 255, 255, 0.90)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(226, 232, 240, 0.90)',
                },
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <X size={20} color={isDark ? '#f8fafc' : '#0f172a'} />
            </Pressable>

            <H2 fontWeight="900" fontSize="$6" color="$color" letterSpacing={-0.4}>
              Add Expense
            </H2>

            <Button
              size="$3"
              borderRadius="$6"
              backgroundColor="$blue10"
              color="white"
              icon={<Check size={16} color="white" />}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                handleSubmit(onSubmit as any)();
              }}
              disabled={isSubmitting || addExpenseMutation.isPending}
              pressStyle={{ opacity: 0.85, scale: 0.96 }}
            >
              <Text color="white" fontWeight="800" fontSize="$2">
                Save
              </Text>
            </Button>
          </XStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          >
            {/* AI Receipt Scanner Trigger / Scanned Receipt Card */}
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              style={styles.cardMargin}
            >
              {scannedReceipt ? (
                <ReceiptBadgeCard
                  receipt={scannedReceipt}
                  onRemove={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setScannedReceipt(null);
                  }}
                  onPressPreview={() => setScannerOpen(true)}
                />
              ) : (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setScannerOpen(true);
                  }}
                  style={({ pressed }) => [
                    styles.scanReceiptButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(2, 132, 199, 0.07)',
                      borderColor: isDark
                        ? 'rgba(56, 189, 248, 0.32)'
                        : 'rgba(2, 132, 199, 0.22)',
                    },
                    pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
                  ]}
                >
                  <XStack alignItems="center" justifyContent="center" gap="$2.5">
                    <YStack
                      width={30}
                      height={30}
                      borderRadius={10}
                      backgroundColor={isDark ? '#0284c7' : '#0284c7'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Sparkles size={16} color="#ffffff" />
                    </YStack>
                    <YStack>
                      <Text fontWeight="800" fontSize="$3" color={isDark ? '#38bdf8' : '#0284c7'}>
                        Scan Receipt with AI
                      </Text>
                      <Text fontSize={11} color="$gray10" fontWeight="600">
                        Auto-fill merchant, amount & category
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>
              )}
            </MotiView>

            {/* Amount & Title Glass Card */}
            <MotiView
              from={{ opacity: 0, translateY: -8, scale: 0.98 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <GlassCard variant="elevated" borderRadius={24} p={18} style={styles.cardMargin}>
                <Paragraph size="$1" color="$gray10" fontWeight="800" textTransform="uppercase" letterSpacing={0.8} mb="$1">
                  Amount
                </Paragraph>
                <XStack alignItems="center" gap="$2">
                  <Text fontSize="$8" fontWeight="900" color={isDark ? '#38bdf8' : '#0284c7'}>
                    {selectedCurrency}
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        flex={1}
                        size="$6"
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        fontWeight="900"
                        fontSize="$8"
                        borderWidth={0}
                        backgroundColor="transparent"
                        color="$color"
                        value={value ? String(value) : ''}
                        onChangeText={(val) => onChange(parseFloat(val) || 0)}
                      />
                    )}
                  />
                </XStack>
                {errors.amount && (
                  <XStack alignItems="center" gap="$1" mt="$1">
                    <AlertCircle size={14} color="#dc2626" />
                    <Paragraph size="$1" color="#dc2626">
                      {errors.amount.message}
                    </Paragraph>
                  </XStack>
                )}

                <Separator my="$3" borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.85)'} />

                <Paragraph size="$1" color="$gray10" fontWeight="800" textTransform="uppercase" letterSpacing={0.8} mb="$1.5">
                  Description
                </Paragraph>
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      size="$4"
                      placeholder="e.g. Dinner with team, Airport Cab, Groceries"
                      value={value}
                      onChangeText={onChange}
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.90)'}
                      backgroundColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.95)'}
                      color="$color"
                    />
                  )}
                />
                {errors.title && (
                  <XStack alignItems="center" gap="$1" mt="$1.5">
                    <AlertCircle size={14} color="#dc2626" />
                    <Paragraph size="$1" color="#dc2626">
                      {errors.title.message}
                    </Paragraph>
                  </XStack>
                )}

                {/* Category Selector Subcomponent */}
                <Paragraph size="$1" color="$gray10" fontWeight="800" textTransform="uppercase" letterSpacing={0.8} mt="$3" mb="$2">
                  Category
                </Paragraph>
                <CategorySelector
                  selectedCategory={watchCategory}
                  onSelectCategory={(cat) => setValue('category', cat as any)}
                />
              </GlassCard>
            </MotiView>

            {/* Paid By Selection Glass Card */}
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 18, delay: 50 }}
            >
              <GlassCard variant="card" borderRadius={22} p={16} style={styles.cardMargin}>
                <Text fontWeight="800" fontSize="$2" color="$gray10" mb="$2.5" textTransform="uppercase" letterSpacing={0.8}>
                  Paid By
                </Text>
                <XStack gap="$2" flexWrap="wrap">
                  {members.map((member) => {
                    const isSelected = watchPaidBy === member.userId;
                    const isUser = member.userId === currentUser?.id;

                    return (
                      <FilterPill
                        key={member.userId}
                        label={isUser ? 'You' : member.displayName}
                        active={isSelected}
                        onPress={() => setValue('paidBy', member.userId)}
                      />
                    );
                  })}
                </XStack>
              </GlassCard>
            </MotiView>

            {/* Split Mode Selector Glass Card */}
            <MotiView
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 18, delay: 90 }}
            >
              <GlassCard variant="card" borderRadius={22} p={16} style={styles.cardMargin}>
                <Text fontWeight="800" fontSize="$2" color="$gray10" mb="$3" textTransform="uppercase" letterSpacing={0.8}>
                  Split Method
                </Text>

                {/* Split Type Selector Subcomponent */}
                <SplitTypeSelector
                  splitType={watchSplitType as any}
                  onChangeSplitType={(type) => setValue('splitType', type)}
                />

                {/* Split Members Breakdown */}
                <YStack gap="$2.5">
                  {members.map((member, idx) => {
                    const isUser = member.userId === currentUser?.id;

                    return (
                      <XStack key={member.userId} justifyContent="space-between" alignItems="center" py="$1">
                        <XStack alignItems="center" gap="$2">
                          <UserAvatar
                            name={member.displayName}
                            size="xs"
                            isCurrentUser={isUser}
                          />
                          <Text fontWeight="700" fontSize="$3" color="$color">
                            {isUser ? 'You' : member.displayName}
                          </Text>
                        </XStack>

                        {watchSplitType === 'equal' ? (
                          <Text fontWeight="900" fontSize="$3" color={isDark ? '#38bdf8' : '#0284c7'}>
                            {formatCurrency(watchSplits[idx]?.amount || 0, selectedCurrency)}
                          </Text>
                        ) : (
                          <Input
                            width={100}
                            size="$2.5"
                            keyboardType="decimal-pad"
                            textAlign="right"
                            fontWeight="700"
                            borderRadius="$3"
                            borderWidth={1}
                            borderColor={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.90)'}
                            backgroundColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.95)'}
                            color="$color"
                            value={String(watchSplits[idx]?.amount || '')}
                            onChangeText={(val) => {
                              const updated = [...watchSplits];
                              updated[idx] = {
                                userId: member.userId,
                                amount: parseFloat(val) || 0,
                              };
                              setValue('splits', updated);
                            }}
                          />
                        )}
                      </XStack>
                    );
                  })}
                </YStack>

                {errors.splits && (
                  <XStack alignItems="center" gap="$1" mt="$3">
                    <AlertCircle size={14} color="#dc2626" />
                    <Paragraph size="$1" color="#dc2626">
                      {errors.splits.message}
                    </Paragraph>
                  </XStack>
                )}
              </GlassCard>
            </MotiView>
          </ScrollView>
        </YStack>

        <ReceiptScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onReceiptParsed={handleReceiptParsed}
        />
      </KeyboardAvoidingView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardMargin: {
    marginBottom: 14,
  },
  scanReceiptButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
