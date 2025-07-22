import { getFirestorePermissionMessage } from '@/utils/checkFirestorePermission';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '@/constants/theme';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { AppDispatch, RootState } from '@/store';
import { clearError, signInWithEmail } from '@/store/slices/authSlice';
import { hp } from '@/utils/dimensions';

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const userData = await dispatch(
        signInWithEmail({ email: email.trim(), password })
      ).unwrap();

      // Show success message with retrieved user data
      Alert.alert(
        'Login Successful',
        `Welcome back, ${userData.displayName}! Your user data has been retrieved from Firestore.`,
        [{ text: 'Continue' }]
      );
    } catch (error: any) {
      console.error('Login error:', error);

      // Check if it's a Firestore permission error
      if (error && error.includes && error.includes('permission-denied')) {
        // Show Firestore permission error message
        setPermissionError(getFirestorePermissionMessage());
      }
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
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
              Welcome Back
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: colors.text }]}>
              Sign in to continue managing your expenses
            </Text>

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
              autoComplete="password"
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}>
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.textButton}>
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={{ color: colors.text }}>Don't have an account?</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('SignUp')}
            compact>
            Sign Up
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
    padding: spacing.lg,
    justifyContent: 'center',
    marginVertical: hp('25%'),
  },
  card: {
    padding: spacing.md,
    // marginVertical: spacing.lg,
    elevation: 4,
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
  textButton: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});

export default LoginScreen;
