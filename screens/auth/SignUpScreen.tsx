import { getFirestorePermissionMessage } from '@/utils/checkFirestorePermission';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '@/constants/theme';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { AppDispatch, RootState } from '@/store';
import { clearError, signUpWithEmail } from '@/store/slices/authSlice';
import { hp } from '@/utils/dimensions';

type SignUpScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'SignUp'
>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (
      !displayName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await dispatch(
        signUpWithEmail({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        })
      ).unwrap();

      // Show success message with user data saved to Firestore
      Alert.alert(
        'Account Created',
        `Your account has been created successfully! User data has been saved to Firestore.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);

      // Check if it's a Firestore permission error
      if (error && error.includes && error.includes('permission-denied')) {
        // Show Firestore permission error message
        setPermissionError(getFirestorePermissionMessage());
      }
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: colors.primary }]}>
              Create Account
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: colors.text }]}>
              Join us to start tracking your expenses
            </Text>

            <TextInput
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.button}>
              Create Account
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={{ color: colors.text }}>Already have an account?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            compact>
            Sign In
          </Button>
        </View>
      </View>

      {/* Firestore permission error message */}
      <Snackbar
        visible={!!permissionError}
        onDismiss={() => setPermissionError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => setPermissionError(null),
        }}
        duration={8000}
        style={{ backgroundColor: colors.error }}>
        {permissionError}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    marginVertical: hp('20%'),
  },
  card: {
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});

export default SignUpScreen;
