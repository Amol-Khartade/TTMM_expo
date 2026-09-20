import React, { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  H2,
  Paragraph,
  Input,
  Separator,
} from 'tamagui';
import { X, Check, AlertCircle } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createExpenseSchema, CreateExpenseInput } from '@/schemas/expenseSchema';
import { useAddExpenseMutation } from '@/queries/useExpenses';
import { useGroupDetailsQuery, useUserGroupsQuery } from '@/queries/useGroups';
import { useAppStore } from '@/store/useAppStore';

export default function AddExpenseModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const currentUser = useAppStore((state) => state.currentUser);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [selectedGroupId] = useState(groupId || '');
  const { data: userGroups = [] } = useUserGroupsQuery(currentUser?.id);
  const { data: activeGroup } = useGroupDetailsQuery(selectedGroupId || userGroups[0]?.id);

  const addExpenseMutation = useAddExpenseMutation();

  const members = activeGroup?.members || [];

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
      currency: selectedCurrency,
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

  const onSubmit = async (data: CreateExpenseInput) => {
    try {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} pt={insets.top} px="$4" backgroundColor="$background">
        {/* Modal Header */}
        <XStack justifyContent="space-between" alignItems="center" py="$3">
          <Button
            size="$3"
            circular
            chromeless
            icon={<X size={22} />}
            onPress={() => router.back()}
          />
          <H2 fontWeight="900" fontSize="$5">
            Add Expense
          </H2>
          <Button
            size="$3"
            theme="active"
            icon={<Check size={18} />}
            onPress={handleSubmit(onSubmit as any)}
            disabled={isSubmitting || addExpenseMutation.isPending}
          >
            Save
          </Button>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Amount & Title Input */}
          <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" borderRadius="$6">
            <XStack alignItems="center" gap="$2" mb="$2">
              <Text fontSize="$8" fontWeight="900" color="$color">
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
                    value={value ? String(value) : ''}
                    onChangeText={(val) => onChange(parseFloat(val) || 0)}
                  />
                )}
              />
            </XStack>
            {errors.amount && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.amount.message}
                </Paragraph>
              </XStack>
            )}

            <Separator my="$3" />

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  size="$4"
                  placeholder="What was this expense for? (e.g. Dinner, Taxi)"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.title && (
              <XStack alignItems="center" gap="$1" mt="$1">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.title.message}
                </Paragraph>
              </XStack>
            )}
          </Card>

          {/* Group & Payer Selection */}
          <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" borderRadius="$5">
            <Text fontWeight="700" fontSize="$2" color="$gray10" mb="$2" textTransform="uppercase">
              Paid By
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              {members.map((member) => (
                <Button
                  key={member.userId}
                  size="$2.5"
                  theme={watch('paidBy') === member.userId ? 'active' : undefined}
                  chromeless={watch('paidBy') !== member.userId}
                  onPress={() => setValue('paidBy', member.userId)}
                  mb="$2"
                >
                  {member.userId === currentUser?.id ? 'You' : member.displayName}
                </Button>
              ))}
            </XStack>
          </Card>

          {/* Split Mode Selector */}
          <Card borderWidth={1} borderColor="#e2e8f0" p="$4" mb="$4" borderRadius="$5">
            <Text fontWeight="700" fontSize="$2" color="$gray10" mb="$3" textTransform="uppercase">
              Split Type
            </Text>
            <XStack backgroundColor="$gray3" p="$1" borderRadius="$5" mb="$3">
              {(['equal', 'exact', 'percentage', 'shares'] as const).map((type) => (
                <Button
                  key={type}
                  flex={1}
                  size="$2.5"
                  theme={watchSplitType === type ? 'active' : undefined}
                  chromeless={watchSplitType !== type}
                  onPress={() => setValue('splitType', type)}
                >
                  {type.toUpperCase()}
                </Button>
              ))}
            </XStack>

            {/* Split Members Breakdown */}
            <YStack gap="$2">
              {members.map((member, idx) => (
                <XStack key={member.userId} justifyContent="space-between" alignItems="center" py="$1.5">
                  <Text fontWeight="600">{member.userId === currentUser?.id ? 'You' : member.displayName}</Text>
                  {watchSplitType === 'equal' ? (
                    <Text fontWeight="800" color="$blue10">
                      {selectedCurrency} {(watchSplits[idx]?.amount || 0).toFixed(2)}
                    </Text>
                  ) : (
                    <Input
                      width={100}
                      size="$2.5"
                      keyboardType="decimal-pad"
                      textAlign="right"
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
              ))}
            </YStack>
            {errors.splits && (
              <XStack alignItems="center" gap="$1" mt="$2">
                <AlertCircle size={14} color="#dc2626" />
                <Paragraph size="$1" color="$red10">
                  {errors.splits.message}
                </Paragraph>
              </XStack>
            )}
          </Card>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
