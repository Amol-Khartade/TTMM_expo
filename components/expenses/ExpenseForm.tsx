import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Chip,
  Portal,
  Dialog,
  List,
  Divider,
  ProgressBar,
} from 'react-native-paper';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Expense, GroupMember } from '@/types';
import { CreateExpenseData, UpdateExpenseData } from '@/services/expenseService';
import { ExpenseCalculations } from '@/utils/expenseCalculations';
import { spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/formatters';

interface ExpenseFormProps {
  expense?: Expense; // For editing
  groupMembers: GroupMember[];
  onSubmit: (data: CreateExpenseData | UpdateExpenseData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EXPENSE_CATEGORIES = [
  { label: 'Food & Dining', value: 'food', icon: '🍕' },
  { label: 'Transportation', value: 'transport', icon: '🚗' },
  { label: 'Entertainment', value: 'entertainment', icon: '🎬' },
  { label: 'Shopping', value: 'shopping', icon: '🛍️' },
  { label: 'Utilities', value: 'utilities', icon: '⚡' },
  { label: 'Healthcare', value: 'healthcare', icon: '🏥' },
  { label: 'Education', value: 'education', icon: '📚' },
  { label: 'Travel', value: 'travel', icon: '✈️' },
  { label: 'Other', value: 'other', icon: '💰' },
];

const SPLIT_TYPES = [
  { label: 'Split Equally', value: 'equal' as const, icon: '⚖️' },
  { label: 'Split by Percentage', value: 'percentage' as const, icon: '📊' },
  { label: 'Split by Exact Amount', value: 'exact' as const, icon: '💵' },
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  groupMembers,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  // Form state
  const [title, setTitle] = useState(expense?.title || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [category, setCategory] = useState(expense?.category || 'other');
  const [date, setDate] = useState(expense?.date || new Date());
  const [paidBy, setPaidBy] = useState(expense?.paidBy || user?.id || '');
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'exact'>(
    expense?.splitType || 'equal'
  );
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    expense?.splitDetails.map(split => split.userId) || [user?.id || '']
  );
  const [customSplits, setCustomSplits] = useState<Record<string, number>>(
    expense?.splitDetails.reduce((acc, split) => {
      if (expense.splitType === 'percentage') {
        acc[split.userId] = split.percentage || 0;
      } else if (expense.splitType === 'exact') {
        acc[split.userId] = split.amount;
      }
      return acc;
    }, {} as Record<string, number>) || {}
  );

  // Dialog states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showPaidByDialog, setShowPaidByDialog] = useState(false);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate split preview
  const splitPreview = useMemo(() => {
    if (!amount || !selectedParticipants.length || !parseFloat(amount)) {
      return { isValid: false, splits: [], error: 'Missing data' };
    }

    const participants = selectedParticipants.map(userId => ({
      userId,
      displayName: groupMembers.find(m => m.userId === userId)?.displayName || 'Unknown',
    }));

    const result = ExpenseCalculations.calculateSplitPreview(
      parseFloat(amount),
      splitType,
      participants,
      customSplits
    );

    return result;
  }, [amount, splitType, selectedParticipants, customSplits, groupMembers]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (selectedParticipants.length === 0) {
      newErrors.participants = 'At least one participant is required';
    }

    if (!splitPreview.isValid) {
      newErrors.split = splitPreview.error || 'Invalid split configuration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, amount, paidBy, selectedParticipants, splitPreview]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      const formData = {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parseFloat(amount),
        currency: 'USD', // TODO: Make configurable
        paidBy,
        splitType,
        splitDetails: splitPreview.splits,
        category,
        date,
      };

      if (expense) {
        // Update existing expense
        await onSubmit({
          id: expense.id,
          ...formData,
        } as UpdateExpenseData);
      } else {
        // Create new expense
        await onSubmit({
          groupId: groupMembers[0]?.userId ? 'group-id' : '', // TODO: Get actual group ID
          ...formData,
        } as CreateExpenseData);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save expense');
    }
  }, [validateForm, user, title, description, amount, paidBy, splitType, splitPreview.splits, category, date, expense, onSubmit]);

  // Handle participant toggle
  const toggleParticipant = useCallback((userId: string) => {
    setSelectedParticipants(prev => {
      const newParticipants = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      // Reset custom splits when participants change
      if (splitType !== 'equal') {
        setCustomSplits({});
      }
      
      return newParticipants;
    });
  }, [splitType]);

  // Handle custom split change
  const handleCustomSplitChange = useCallback((userId: string, value: number) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: value,
    }));
  }, []);

  // Get selected category info
  const selectedCategoryInfo = EXPENSE_CATEGORIES.find(cat => cat.value === category);

  // Get payer info
  const payerInfo = groupMembers.find(member => member.userId === paidBy);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Info Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Basic Information
            </Text>
            
            <TextInput
              label="Expense Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
              placeholder="e.g., Dinner at restaurant"
              accessibilityLabel="Expense title input"
            />
            {errors.title && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.title}
              </Text>
            )}

            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={2}
              placeholder="Add details about this expense..."
              accessibilityLabel="Expense description input"
            />

            <TextInput
              label="Amount *"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
              error={!!errors.amount}
              placeholder="0.00"
              left={<TextInput.Icon icon="currency-usd" />}
              accessibilityLabel="Expense amount input"
            />
            {errors.amount && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.amount}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Category and Date Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Category & Date
            </Text>

            <List.Item
              title="Category"
              description={selectedCategoryInfo?.label}
              left={() => (
                <Text style={styles.categoryIcon}>
                  {selectedCategoryInfo?.icon}
                </Text>
              )}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setShowCategoryDialog(true)}
              style={styles.listItem}
            />

            <List.Item
              title="Date"
              description={date.toLocaleDateString()}
              left={() => <List.Icon icon="calendar" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setShowDatePicker(true)}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Payment Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment
            </Text>

            <List.Item
              title="Paid by"
              description={payerInfo?.displayName || 'Select person'}
              left={() => <List.Icon icon="account" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setShowPaidByDialog(true)}
              style={styles.listItem}
            />
            {errors.paidBy && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.paidBy}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Split Section */}
        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Split Details
            </Text>

            {/* Split Type */}
            <Text variant="bodyMedium" style={styles.subsectionTitle}>
              Split Type
            </Text>
            <View style={styles.splitTypeContainer}>
              {SPLIT_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  selected={splitType === type.value}
                  onPress={() => setSplitType(type.value)}
                  style={[
                    styles.splitTypeChip,
                    splitType === type.value && { backgroundColor: colors.primary }
                  ]}
                  textStyle={[
                    splitType === type.value && { color: '#fff' }
                  ]}
                  icon={type.icon}
                >
                  {type.label}
                </Chip>
              ))}
            </View>

            {/* Participants */}
            <List.Item
              title="Participants"
              description={`${selectedParticipants.length} selected`}
              left={() => <List.Icon icon="account-group" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => setShowParticipantsDialog(true)}
              style={styles.listItem}
            />

            {/* Split Preview */}
            {splitPreview.isValid && (
              <View style={styles.splitPreview}>
                <Text variant="bodyMedium" style={styles.subsectionTitle}>
                  Split Preview
                </Text>
                {splitPreview.splits.map((split) => {
                  const member = groupMembers.find(m => m.userId === split.userId);
                  return (
                    <View key={split.userId} style={styles.splitPreviewItem}>
                      <Text variant="bodyMedium">{member?.displayName}</Text>
                      <Text variant="bodyMedium">
                        {formatCurrency(split.amount)}
                        {split.percentage && ` (${split.percentage}%)`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {!splitPreview.isValid && splitPreview.error && (
              <Text variant="bodySmall" style={styles.errorText}>
                {splitPreview.error}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Custom Split Inputs */}
        {splitType !== 'equal' && selectedParticipants.length > 0 && (
          <Card style={styles.section}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {splitType === 'percentage' ? 'Percentage Split' : 'Exact Amount Split'}
              </Text>
              
              {selectedParticipants.map((userId) => {
                const member = groupMembers.find(m => m.userId === userId);
                return (
                  <TextInput
                    key={userId}
                    label={`${member?.displayName} ${splitType === 'percentage' ? '(%)' : '($)'}`}
                    value={(customSplits[userId] || 0).toString()}
                    onChangeText={(text) => handleCustomSplitChange(userId, parseFloat(text) || 0)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder={splitType === 'percentage' ? '0' : '0.00'}
                  />
                );
              })}
              
              {splitType === 'percentage' && (
                <ProgressBar
                  progress={Object.values(customSplits).reduce((sum, val) => sum + val, 0) / 100}
                  style={styles.progressBar}
                  color={colors.primary}
                />
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            loading={loading}
            disabled={loading || !splitPreview.isValid}
          >
            {expense ? 'Update Expense' : 'Create Expense'}
          </Button>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {/* {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )} */}

      {/* Category Dialog */}
      <Portal>
        <Dialog visible={showCategoryDialog} onDismiss={() => setShowCategoryDialog(false)}>
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.Content>
            {EXPENSE_CATEGORIES.map((cat) => (
              <List.Item
                key={cat.value}
                title={cat.label}
                left={() => <Text style={styles.categoryIcon}>{cat.icon}</Text>}
                onPress={() => {
                  setCategory(cat.value);
                  setShowCategoryDialog(false);
                }}
                style={category === cat.value && { backgroundColor: colors.primary + '20' }}
              />
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Paid By Dialog */}
      <Portal>
        <Dialog visible={showPaidByDialog} onDismiss={() => setShowPaidByDialog(false)}>
          <Dialog.Title>Who Paid?</Dialog.Title>
          <Dialog.Content>
            {groupMembers.map((member) => (
              <List.Item
                key={member.userId}
                title={member.displayName}
                description={member.email}
                onPress={() => {
                  setPaidBy(member.userId);
                  setShowPaidByDialog(false);
                }}
                style={paidBy === member.userId && { backgroundColor: colors.primary + '20' }}
              />
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Participants Dialog */}
      <Portal>
        <Dialog visible={showParticipantsDialog} onDismiss={() => setShowParticipantsDialog(false)}>
          <Dialog.Title>Select Participants</Dialog.Title>
          <Dialog.Content>
            {groupMembers.map((member) => (
              <List.Item
                key={member.userId}
                title={member.displayName}
                description={member.email}
                left={() => (
                  <List.Icon 
                    icon={selectedParticipants.includes(member.userId) ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                  />
                )}
                onPress={() => toggleParticipant(member.userId)}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowParticipantsDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  subsectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  input: {
    marginBottom: spacing.sm,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  categoryIcon: {
    fontSize: 24,
    lineHeight: 24,
    textAlign: 'center',
    width: 40,
  },
  splitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  splitTypeChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  splitPreview: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  splitPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressBar: {
    marginTop: spacing.sm,
    height: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: spacing.sm,
  },
  submitButton: {},
  errorText: {
    color: '#f44336',
    marginTop: -spacing.sm + 2,
    marginBottom: spacing.sm,
  },
});

export default ExpenseForm;