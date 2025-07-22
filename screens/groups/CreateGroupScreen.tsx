import { spacing } from '@/constants/theme';
import { MainStackParamList } from '@/navigation/MainNavigator';
import { AppDispatch, RootState } from '@/store';
import { createGroup } from '@/store/slices/groupsSlice';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type CreateGroupScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'CreateGroup'
>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

const CreateGroupScreen: React.FC<Props> = React.memo(({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    if (memberEmails.includes(trimmedEmail)) {
      Alert.alert('Error', 'Email already added');
      return;
    }

    setMemberEmails([...memberEmails, trimmedEmail]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

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
      console.log('Creating group with user:', user);
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      
      // Verify Firebase Auth state
      const currentFirebaseUser = auth().currentUser;
      console.log('Firebase Auth user:', currentFirebaseUser?.uid);
      
      if (!currentFirebaseUser) {
        Alert.alert('Error', 'Authentication expired. Please sign in again.');
        return;
      }
      
      // Create the group data structure that matches Firestore rules
      const groupData = {
        name: groupName.trim(),
        description: description.trim() || '',
        members: [
          {
            userId: user.id,
            displayName: user.displayName || 'Unknown',
            email: user.email || '',
            photoURL: null,
            joinedAt: firestore.Timestamp.now(),
            role: 'admin' as const,
          },
          ...memberEmails.map((email) => ({
            userId: '', // Will be populated when users join
            displayName: '',
            email,
            photoURL: null,
            joinedAt: firestore.Timestamp.now(),
            role: 'member' as const,
          })),
        ],
        createdBy: user.id,
        isActive: true,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      console.log('Group data to be created:', JSON.stringify(groupData, null, 2));
      
      // Directly use Firestore to create the document
      const groupRef = await firestore().collection('groups').add(groupData);
      console.log('Group created with ID:', groupRef.id);

      // Dispatch to Redux store
      await dispatch(
        createGroup({
          name: groupName.trim(),
          description: description.trim(),
          userId: user.id,
          memberEmails,
        })
      ).unwrap();

      Alert.alert('Success', 'Group created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: colors.primary }]}
          accessible>
          Create New Group
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.text }]}
          accessible>
          Start a new group to track expenses with friends and family
        </Text>

        <TextInput
          label="Group Name *"
          value={groupName}
          onChangeText={setGroupName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Weekend Trip, House Expenses"
          error={!groupName.trim() && loading}
          accessibilityLabel="Group name input"
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
          accessibilityLabel="Group description input"
        />

        <TextInput
          label="Add Member Email"
          value={emailInput}
          onChangeText={setEmailInput}
          mode="outlined"
          style={styles.input}
          placeholder="Enter email to add member"
          keyboardType="email-address"
          onSubmitEditing={handleAddEmail}
          accessibilityLabel="Member email input"
        />
        <Button
          mode="contained"
          onPress={handleAddEmail}
          style={styles.addButton}
          disabled={loading}
          accessibilityLabel="Add member button">
          Add Member
        </Button>

        {/* Chip component for email display */}
        <View style={styles.chipContainer}>
          {memberEmails.map((email) => (
            <Chip
              key={email}
              onClose={() => handleRemoveEmail(email)}
              style={styles.chip}
              textStyle={{ color: colors.text }}>
              {email}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleCreateGroup}
          loading={loading}
          disabled={loading}
          style={styles.button}
          accessibilityLabel="Create group button">
          Create Group
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
          accessibilityLabel="Cancel button">
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
});


// +++++++ REPLACE
CreateGroupScreen.displayName = 'CreateGroupScreen';

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
  addButton: {
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  chip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
});

export default CreateGroupScreen;