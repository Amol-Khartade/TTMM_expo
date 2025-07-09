import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, List, Avatar, IconButton, Portal, Dialog, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { AppDispatch, RootState } from '@/store';
import { addMember, removeMember } from '@/store/slices/groupsSlice';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { GroupMember } from '@/types';
import { spacing } from '@/constants/theme';

type GroupDetailsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'GroupDetails'>;
type GroupDetailsScreenRouteProp = RouteProp<MainStackParamList, 'GroupDetails'>;

interface Props {
  navigation: GroupDetailsScreenNavigationProp;
  route: GroupDetailsScreenRouteProp;
}

const GroupDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { currentGroup } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = currentGroup?.members.find(m => m.userId === user?.id)?.role === 'admin';

  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await dispatch(addMember({ groupId, email: memberEmail.trim() })).unwrap();
      setMemberEmail('');
      setShowAddMemberDialog(false);
      Alert.alert('Success', 'Member added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (member.userId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself from the group');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.displayName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeMember({ groupId, userId: member.userId })).unwrap();
              Alert.alert('Success', 'Member removed successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  if (!currentGroup) {
    navigation.goBack();
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={{ color: colors.primary }}>
            {currentGroup.name}
          </Text>
          {currentGroup.description && (
            <Text variant="bodyMedium" style={[styles.description, { color: colors.text }]}>
              {currentGroup.description}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.membersHeader}>
            <Text variant="titleMedium">Members ({currentGroup.members.length})</Text>
            {isAdmin && (
              <Button
                mode="contained"
                compact
                onPress={() => setShowAddMemberDialog(true)}
              >
                Add Member
              </Button>
            )}
          </View>

          {currentGroup.members.map((member) => (
            <List.Item
              key={member.userId}
              title={member.displayName}
              description={member.email}
              left={() => (
                <Avatar.Text
                  size={40}
                  label={member.displayName.charAt(0)}
                  style={{ backgroundColor: colors.primary }}
                />
              )}
              right={() => (
                <View style={styles.memberActions}>
                  {member.role === 'admin' && (
                    <Text variant="bodySmall" style={styles.adminBadge}>
                      Admin
                    </Text>
                  )}
                  {isAdmin && member.role !== 'admin' && member.userId !== user?.id && (
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleRemoveMember(member)}
                    />
                  )}
                </View>
              )}
            />
          ))}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddExpense', { groupId })}
          style={styles.actionButton}
        >
          Add Expense
        </Button>
        <Button
          mode="outlined"
          onPress={() => {
            // Navigate to group expenses
            navigation.navigate('ExpensesTab');
          }}
          style={styles.actionButton}
        >
          View Expenses
        </Button>
      </View>

      <Portal>
        <Dialog visible={showAddMemberDialog} onDismiss={() => setShowAddMemberDialog(false)}>
          <Dialog.Title>Add Member</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email Address"
              value={memberEmail}
              onChangeText={setMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddMemberDialog(false)}>Cancel</Button>
            <Button onPress={handleAddMember} loading={loading}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  description: {
    marginTop: spacing.sm,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    marginRight: spacing.sm,
  },
  actions: {
    padding: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});

export default GroupDetailsScreen;