import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { spacing, typography } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { colors } = useSelector((state: RootState) => state.theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }, typography.h2]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: colors.text }, typography.body1]}>
        An unexpected error occurred. Please try again.
      </Text>
      <Button
        mode="contained"
        onPress={onRetry}
        style={styles.retryButton}
        buttonColor={colors.primary}
      >
        Try Again
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.md,
  },
});

export default ErrorBoundary;