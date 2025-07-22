import ExpenseCard from '@/components/expenses/ExpenseCard';
import { spacing } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { AppDispatch, RootState } from '@/store';
import {
  clearFilters,
  deleteExpense,
  fetchGroupExpenses,
  loadMoreExpenses,
  optimisticDeleteExpense,
  setFilters,
} from '@/store/slices/expensesSlice';
import { Expense } from '@/types';
import { ExpenseCalculations } from '@/utils/expenseCalculations';
import { formatCurrency } from '@/utils/formatters';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  FAB,
  Menu,
  Searchbar,
  Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

type ExpensesScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'Expenses'
>;

type ExpensesScreenRouteProp = RouteProp<MainStackParamList, 'Expenses'>;

interface Props {
  navigation: ExpensesScreenNavigationProp;
  route: ExpensesScreenRouteProp;
}

const ExpensesScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    expenses,
    loading,
    isLoadingMore,
    hasMoreExpenses,
    error,
    filters,
    analytics,
  } = useSelector((state: RootState) => state.expenses);

  // Get group info from route params
  const groupId = route.params?.groupId;
  const groupMembers = route.params?.groupMembers || [];

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchTerm || '');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    if (!expenses.length) return [];

    return ExpenseCalculations.filterAndSortExpenses(
      expenses,
      {
        category: filters.category || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        searchTerm: searchQuery || undefined,
      },
      sortBy,
      sortOrder
    );
  }, [expenses, filters, searchQuery, sortBy, sortOrder]);

  // Calculate user's financial summary
  const userSummary = useMemo(() => {
    if (!user || !filteredExpenses.length) {
      return {
        totalExpenses: 0,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0,
        expenseCount: 0,
      };
    }

    return ExpenseCalculations.calculateUserSummary(filteredExpenses, user.id);
  }, [filteredExpenses, user]);

  // Load expenses on mount
  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupExpenses({ groupId, refresh: true }));
    }
  }, [dispatch, groupId]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!groupId) return;

    setRefreshing(true);
    try {
      await dispatch(fetchGroupExpenses({ groupId, refresh: true })).unwrap();
    } catch (error) {
      console.error('Error refreshing expenses:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, groupId]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!groupId || !hasMoreExpenses || isLoadingMore) return;

    dispatch(loadMoreExpenses(groupId));
  }, [dispatch, groupId, hasMoreExpenses, isLoadingMore]);

  // Handle expense press
  const handleExpensePress = useCallback(
    (expense: Expense) => {
      navigation.navigate('ExpenseDetails', {
        expenseId: expense.id,
        groupMembers,
      });
    },
    [navigation, groupMembers]
  );

  // Handle expense long press (show options)
  const handleExpenseLongPress = useCallback(
    (expense: Expense) => {
      if (!user) return;

      const canEdit = expense.createdBy === user.id;
      const canDelete = expense.createdBy === user.id;

      const actions = [];

      if (canEdit) {
        actions.push({
          text: 'Edit',
          onPress: () =>
            navigation.navigate('EditExpense', {
              expense,
              groupMembers,
            }),
        });
      }

      if (canDelete) {
        actions.push({
          text: 'Delete',
          style: 'destructive' as const,
          onPress: () => handleDeleteExpense(expense),
        });
      }

      if (actions.length === 0) return;

      Alert.alert('Expense Options', 'Choose an action', [
        ...actions,
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [user, navigation, groupMembers]
  );

  // Handle delete expense
  const handleDeleteExpense = useCallback(
    (expense: Expense) => {
      Alert.alert(
        'Delete Expense',
        `Are you sure you want to delete "${expense.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Optimistic delete
              dispatch(optimisticDeleteExpense(expense.id));

              try {
                await dispatch(deleteExpense(expense.id)).unwrap();
              } catch (error) {
                console.error('Error deleting expense:', error);
                Alert.alert(
                  'Error',
                  error instanceof Error
                    ? error.message
                    : 'Failed to delete expense'
                );
                // Refresh to restore the expense if deletion failed
                handleRefresh();
              }
            },
          },
        ]
      );
    },
    [dispatch, handleRefresh]
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      dispatch(setFilters({ ...filters, searchTerm: query || null }));
    },
    [dispatch, filters]
  );

  // Handle add expense
  const handleAddExpense = useCallback(() => {
    navigation.navigate('AddExpense', {
      groupId,
      groupMembers,
    });
  }, [navigation, groupId, groupMembers]);

  // Render expense item
  const renderExpenseItem: ListRenderItem<Expense> = useCallback(
    ({ item }) => (
      <ExpenseCard
        expense={item}
        currentUserId={user?.id || ''}
        onPress={() => handleExpensePress(item)}
        onLongPress={() => handleExpenseLongPress(item)}
      />
    ),
    [user?.id, handleExpensePress, handleExpenseLongPress]
  );

  // Render list header with summary
  const renderListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Financial Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={styles.summaryTitle}>
              Your Summary
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text
                  variant="bodySmall"
                  style={styles.summaryLabel}>
                  Total Paid
                </Text>
                <Text
                  variant="titleSmall"
                  style={[styles.summaryValue, { color: '#2196F3' }]}>
                  {formatCurrency(userSummary.totalPaid)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text
                  variant="bodySmall"
                  style={styles.summaryLabel}>
                  Total Owed
                </Text>
                <Text
                  variant="titleSmall"
                  style={[styles.summaryValue, { color: '#FF9800' }]}>
                  {formatCurrency(userSummary.totalOwed)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text
                  variant="bodySmall"
                  style={styles.summaryLabel}>
                  Net Balance
                </Text>
                <Text
                  variant="titleSmall"
                  style={[
                    styles.summaryValue,
                    { color: userSummary.balance >= 0 ? '#4CAF50' : '#f44336' },
                  ]}>
                  {formatCurrency(userSummary.balance)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text
                  variant="bodySmall"
                  style={styles.summaryLabel}>
                  Expenses
                </Text>
                <Text
                  variant="titleSmall"
                  style={styles.summaryValue}>
                  {userSummary.expenseCount}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search expenses..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
          />
          <Menu
            visible={showFilterMenu}
            onDismiss={() => setShowFilterMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowFilterMenu(true)}
                icon="filter-variant"
                compact>
                Filter
              </Button>
            }>
            <Menu.Item
              title="Sort by Date"
              onPress={() => {
                setSortBy('date');
                setShowFilterMenu(false);
              }}
            />
            <Menu.Item
              title="Sort by Amount"
              onPress={() => {
                setSortBy('amount');
                setShowFilterMenu(false);
              }}
            />
            <Menu.Item
              title="Sort by Title"
              onPress={() => {
                setSortBy('title');
                setShowFilterMenu(false);
              }}
            />
            <Divider />
            <Menu.Item
              title={`${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
              onPress={() => {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                setShowFilterMenu(false);
              }}
            />
            <Divider />
            <Menu.Item
              title="Clear Filters"
              onPress={() => {
                dispatch(clearFilters());
                setSearchQuery('');
                setShowFilterMenu(false);
              }}
            />
          </Menu>
        </View>

        {filteredExpenses.length > 0 && (
          <Text
            variant="bodyMedium"
            style={styles.resultsCount}>
            Showing {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    ),
    [
      userSummary,
      searchQuery,
      handleSearch,
      showFilterMenu,
      sortBy,
      sortOrder,
      dispatch,
      filters,
      filteredExpenses.length,
    ]
  );

  // Render empty state
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text
          variant="headlineSmall"
          style={styles.emptyTitle}>
          No Expenses Yet
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.emptyDescription}>
          Start by adding your first expense to this group
        </Text>
        <Button
          mode="contained"
          onPress={handleAddExpense}
          style={styles.emptyButton}
          icon="plus">
          Add First Expense
        </Button>
      </View>
    ),
    [handleAddExpense]
  );

  // Render footer with load more
  const renderListFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" />
        <Text
          variant="bodySmall"
          style={styles.loadingText}>
          Loading more expenses...
        </Text>
      </View>
    );
  }, [isLoadingMore]);

  if (loading && !refreshing && filteredExpenses.length === 0) {
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
          Loading expenses...
        </Text>
      </View>
    );
  }

  if (error && filteredExpenses.length === 0) {
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
          Unable to Load Expenses
        </Text>
        <Text
          variant="bodyMedium"
          style={styles.errorMessage}>
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={handleRefresh}
          style={styles.retryButton}
          icon="refresh">
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredExpenses.length === 0 ? styles.emptyList : undefined
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddExpense}
        accessibilityLabel="Add new expense"
      />
    </View>
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
  headerContainer: {
    padding: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryTitle: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  summaryValue: {
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchbar: {
    flex: 1,
    marginRight: spacing.sm,
  },
  resultsCount: {
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyButton: {
    minWidth: 200,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    marginLeft: spacing.sm,
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
  retryButton: {
    minWidth: 150,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});

export default ExpensesScreen;
