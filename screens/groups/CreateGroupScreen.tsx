import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';

import { AppDispatch, RootState } from '@/store';
import { createGroup } from '@/store/slices/groupsSlice';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { spacing } from '@/constants/theme';

type CreateGroupScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateGroup'>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

const CreateGroupScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await dispatch(createGroup({
        name: groupName.trim(),
        description: description.trim(),
        userId: user.id,
      })).unwrap();

      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
          Create New Group
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.text }]}>
          Start a new group to track expenses with friends and family
        </Text>

        <TextInput
          label="Group Name *"
          value={groupName}
          onChangeText={setGroupName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Weekend Trip, House Expenses"
        />

        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          placeholder="Brief description of the group..."
        />

        <Button
          mode="contained"
          onPress={handleCreateGroup}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Create Group
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginBottom: spacing.md,
  },
});

export default CreateGroupScreen;