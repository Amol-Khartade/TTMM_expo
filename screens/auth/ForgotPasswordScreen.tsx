import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import { RootState } from '@/store';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { spacing } from '@/constants/theme';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useSelector((state: RootState) => state.theme);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert(
        'Reset Email Sent',
        'A password reset email has been sent to your email address. Please check your inbox.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
              Reset Password
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.text }]}>
              Enter your email address and we'll send you a link to reset your password
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

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Send Reset Email
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.textButton}
            >
              Back to Login
            </Button>
          </Card.Content>
        </Card>
      </View>
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
    marginBottom: spacing.sm,
  },
  textButton: {
    alignSelf: 'center',
  },
});

export default ForgotPasswordScreen;