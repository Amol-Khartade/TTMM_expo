import { spacing } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { expenseService } from '@/services/expenseService';
import { AppDispatch, RootState } from '@/store';
import { deleteExpense } from '@/store/slices/expensesSlice';
import { Expense } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  List,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

type ExpenseDetailsScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'ExpenseDetails'
>;

type ExpenseDetailsScreenRouteProp = RouteProp<
  MainStackParamList,
  'ExpenseDetails'
>;

interface Props {
  navigation: ExpenseDetailsScreenNavigationProp;
  route: ExpenseDetailsScreenRouteProp;
}

const ExpenseDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.expenses);

  // Get params
  const expenseId = route.params?.expenseId;
  const groupMembers = route.params?.groupMembers || [];

  // Local state
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loadingExpense, setLoadingExpense] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expense details
  useEffect(() => {
    const loadExpense = async () => {
      if (!expenseId) {
        setError('Expense ID not provided');
        setLoadingExpense(false);
        return;
      }

      try {
        setLoadingExpense(true);
        const expenseData = await expenseService.getExpenseById(expenseId);

        if (!expenseData) {
          setError('Expense not found');
        } else {
          setExpense(expenseData);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading expense:', err);
        setError(err instanceof Error ? err.message : 'Failed to load expense');
      } finally {
        setLoadingExpense(false);
      }
    };

    loadExpense();
  }, [expenseId]);

  // Handle delete expense
  const handleDelete = useCallback(() => {
    if (!expense) return;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteExpense(expense.id)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to delete expense'
              );
            }
          },
        },
      ]
    );
  }, [dispatch, expense, navigation]);

  // Handle edit expense
  const handleEdit = useCallback(() => {
    if (!expense) return;

    navigation.navigate('EditExpense', {
      expense,
      groupMembers,
    });
  }, [navigation, expense, groupMembers]);

  // Handle share expense
  const handleShare = useCallback(async () => {
    if (!expense) return;

    try {
      const shareMessage = `
Expense: ${expense.title}
Amount: ${formatCurrency(expense.amount)}
Date: ${formatDate(expense.date)}
Paid by: ${
        groupMembers.find((m) => m.userId === expense.paidBy)?.displayName ||
        'Unknown'
      }

Split details:
${expense.splitDetails
  .map((split) => {
    const member = groupMembers.find((m) => m.userId === split.userId);
    return `${member?.displayName || 'Unknown'}: ${formatCurrency(
      split.amount
    )}`;
  })
  .join('\n')}
      `.trim();

      await Share.share({
        message: shareMessage,
        title: `Expense: ${expense.title}`,
      });
    } catch (error) {
      console.error('Error sharing expense:', error);
    }
  }, [expense, groupMembers]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: '🍕',
      transport: '🚗',
      entertainment: '🎬',
      shopping: '🛍️',
      utilities: '⚡',
      healthcare: '🏥',
      education: '📚',
      travel: '✈️',
      other: '💰',
    };
    return icons[category.toLowerCase()] || icons.other;
  };

  // Check if user can edit/delete
  const canModify = expense && user && expense.createdBy === user.id;

  // Setup header buttons
  useEffect(() => {
    if (!expense) return;

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <IconButton
            icon="share-variant"
            onPress={handleShare}
            accessibilityLabel="Share expense"
          />
          {canModify && (
            <>
              <IconButton
                icon="pencil"
                onPress={handleEdit}
                accessibilityLabel="Edit expense"
              />
              <IconButton
                icon="delete"
                onPress={handleDelete}
                accessibilityLabel="Delete expense"
              />
            </>
          )}
        </View>
      ),
    });
  }, [navigation, expense, canModify, handleShare, handleEdit, handleDelete]);

  if (loadingExpense) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}>
        <ActivityIndicator size="large" />
        <Text
          variant="bodyMedium"
          style={styles.loadingText}>
          Loading expense details...
        </Text>
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}>
        <Text
          variant="titleMedium"
          style={styles.errorTitle}>
          Unable to Load Expense
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.errorMessage}>
          {error || 'Expense not found'}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const payerMember = groupMembers.find((m) => m.userId === expense.paidBy);
  const createdByMember = groupMembers.find(
    (m) => m.userId === expense.createdBy
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Basic Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.titleRow}>
            <Text
              variant="headlineSmall"
              style={styles.title}>
              {expense.title}
            </Text>
            <Text
              variant="headlineMedium"
              style={styles.amount}>
              {formatCurrency(expense.amount)}
            </Text>
          </View>

          {expense.description && (
            <Text
              variant="bodyMedium"
              style={styles.description}>
              {expense.description}
            </Text>
          )}

          <View style={styles.infoRow}>
            <Chip
              icon={() => (
                <Text style={styles.categoryIcon}>
                  {getCategoryIcon(expense.category)}
                </Text>
              )}
              style={styles.categoryChip}>
              {expense.category.charAt(0).toUpperCase() +
                expense.category.slice(1)}
            </Chip>
            <Text
              variant="bodyMedium"
              style={styles.date}>
              {formatDate(expense.date, 'long')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={styles.sectionTitle}>
            Payment Information
          </Text>

          <List.Item
            title="Paid by"
            description={payerMember?.displayName || 'Unknown'}
            left={() => (
              <Avatar.Text
                size={40}
                label={payerMember?.displayName.substring(0, 2) || '??'}
              />
            )}
          />

          <List.Item
            title="Split type"
            description={
              expense.splitType === 'equal'
                ? 'Split Equally'
                : expense.splitType === 'percentage'
                ? 'Split by Percentage'
                : 'Split by Amount'
            }
            left={() => <List.Icon icon="calculator" />}
          />
        </Card.Content>
      </Card>

      {/* Split Details Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={styles.sectionTitle}>
            Split Details
          </Text>

          {expense.splitDetails.map((split, index) => {
            const member = groupMembers.find((m) => m.userId === split.userId);
            const isCurrentUser = user && split.userId === user.id;

            return (
              <View key={split.userId}>
                <List.Item
                  title={member?.displayName || 'Unknown'}
                  description={member?.email}
                  right={() => (
                    <View style={styles.splitAmount}>
                      <Text
                        variant="titleSmall"
                        style={[
                          styles.splitAmountText,
                          isCurrentUser && {
                            color: colors.primary,
                            fontWeight: 'bold',
                          },
                        ]}>
                        {formatCurrency(split.amount)}
                      </Text>
                      {split.percentage && (
                        <Text
                          variant="bodySmall"
                          style={styles.splitPercentage}>
                          ({split.percentage}%)
                        </Text>
                      )}
                    </View>
                  )}
                  left={() => (
                    <Avatar.Text
                      size={40}
                      label={member?.displayName.substring(0, 2) || '??'}
                      style={
                        isCurrentUser
                          ? { backgroundColor: colors.primary }
                          : undefined
                      }
                    />
                  )}
                />
                {index < expense.splitDetails.length - 1 && <Divider />}
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Additional Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={styles.sectionTitle}>
            Additional Information
          </Text>

          <List.Item
            title="Created by"
            description={createdByMember?.displayName || 'Unknown'}
            left={() => <List.Icon icon="account-plus" />}
          />

          <List.Item
            title="Created on"
            description={formatDateTime(expense.createdAt)}
            left={() => <List.Icon icon="clock-plus" />}
          />

          {expense.updatedAt > expense.createdAt && (
            <List.Item
              title="Last updated"
              description={formatDateTime(expense.updatedAt)}
              left={() => <List.Icon icon="clock-edit" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      {canModify && (
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            style={styles.actionButton}
            icon="pencil">
            Edit Expense
          </Button>
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.actionButton, styles.deleteButton]}
            buttonColor="#ffebee"
            textColor="#f44336"
            icon="delete">
            Delete Expense
          </Button>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  card: {
    margin: spacing.sm,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    marginRight: spacing.md,
    fontWeight: '600',
  },
  amount: {
    color: '#2196F3',
    fontWeight: '700',
  },
  description: {
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
  },
  categoryIcon: {
    fontSize: 16,
  },
  date: {
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  splitAmount: {
    alignItems: 'flex-end',
  },
  splitAmountText: {
    fontWeight: '600',
  },
  splitPercentage: {
    opacity: 0.7,
    fontSize: 12,
  },
  actionButtons: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  errorTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    opacity: 0.7,
  },
  backButton: {
    minWidth: 120,
  },
});

export default ExpenseDetailsScreen;
