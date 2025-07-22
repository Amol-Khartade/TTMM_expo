import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';

import ExpenseForm from '@/components/expenses/ExpenseForm';
import { spacing } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { CreateExpenseData } from '@/services/expenseService';
import { AppDispatch, RootState } from '@/store';
import {
  createExpense,
  optimisticCreateExpense,
} from '@/store/slices/expensesSlice';


type AddExpenseScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'AddExpense'
>;

type AddExpenseScreenRouteProp = RouteProp<MainStackParamList, 'AddExpense'>;

interface Props {
  navigation: AddExpenseScreenNavigationProp;
  route: AddExpenseScreenRouteProp;
}

const AddExpenseScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.expenses);

  // Get group info from route params
  const groupId = route.params?.groupId;
  const groupMembers = route.params?.groupMembers || [];

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (hasUnsavedChanges) {
          Alert.alert(
            'Discard Changes?',
            'You have unsaved changes. Are you sure you want to go back?',
            [
              { text: 'Stay', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [hasUnsavedChanges, navigation]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (expenseData: CreateExpenseData) => {
      try {
        if (!groupId) {
          Alert.alert('Error', 'Group information is missing');
          return;
        }

        if (!user) {
          Alert.alert('Error', 'User not authenticated');
          return;
        }

        // Create the expense data with group ID
        const fullExpenseData: CreateExpenseData = {
          ...expenseData,
          groupId,
        };

        // Create optimistic update first for better UX
        const optimisticExpense = {
          id: `temp-${Date.now()}`,
          ...fullExpenseData,
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        dispatch(optimisticCreateExpense(optimisticExpense));

        // Show success immediately and navigate back
        navigation.goBack();

        // Create the actual expense in the background
        await dispatch(createExpense(fullExpenseData)).unwrap();
      } catch (error) {
        console.error('Error creating expense:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to create expense'
        );
      }
    },
    [dispatch, navigation, groupId, user]
  );

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasUnsavedChanges, navigation]);

  // Check if required data is available
  if (!groupId || !groupMembers || groupMembers.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          variant="titleMedium"
          style={styles.errorText}>
          Unable to load group information
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ExpenseForm
        groupMembers={groupMembers}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorButton: {
    marginHorizontal: spacing.xl,
  },
});

export default AddExpenseScreen;
