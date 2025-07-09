import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import GroupsScreen from '@/screens/groups/GroupsScreen';
import ExpensesScreen from '@/screens/expenses/ExpensesScreen';
import BalancesScreen from '@/screens/balances/BalancesScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

import CreateGroupScreen from '@/screens/groups/CreateGroupScreen';
import GroupDetailsScreen from '@/screens/groups/GroupDetailsScreen';
import AddExpenseScreen from '@/screens/expenses/AddExpenseScreen';
import ExpenseDetailsScreen from '@/screens/expenses/ExpenseDetailsScreen';
import SettlementScreen from '@/screens/balances/SettlementScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import SubscriptionScreen from '@/screens/profile/SubscriptionScreen';

export type MainTabParamList = {
  GroupsTab: undefined;
  ExpensesTab: undefined;
  BalancesTab: undefined;
  ProfileTab: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  CreateGroup: undefined;
  GroupDetails: { groupId: string };
  AddExpense: { groupId: string };
  ExpenseDetails: { expenseId: string };
  Settlement: { fromUserId: string; toUserId: string; amount: number; groupId: string };
  Notifications: undefined;
  Subscription: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const { colors } = useSelector((state: RootState) => state.theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'GroupsTab':
              iconName = focused ? 'group' : 'group';
              break;
            case 'ExpensesTab':
              iconName = focused ? 'receipt' : 'receipt';
              break;
            case 'BalancesTab':
              iconName = focused ? 'account-balance-wallet' : 'account-balance-wallet';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
      })}
    >
      <Tab.Screen
        name="GroupsTab"
        component={GroupsScreen}
        options={{ title: 'Groups' }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesScreen}
        options={{ title: 'Expenses' }}
      />
      <Tab.Screen
        name="BalancesTab"
        component={BalancesScreen}
        options={{ title: 'Balances' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  const { colors } = useSelector((state: RootState) => state.theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'Create Group' }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ title: 'Group Details' }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <Stack.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{ title: 'Expense Details' }}
      />
      <Stack.Screen
        name="Settlement"
        component={SettlementScreen}
        options={{ title: 'Settle Up' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Premium Subscription' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;