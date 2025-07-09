import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const SubscriptionScreen: React.FC = () => {
  const { colors } = useSelector((state: RootState) => state.theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="titleLarge" style={{ color: colors.text }}>
        Subscription Screen
      </Text>
      <Text style={{ color: colors.text }}>
        This screen will handle premium subscriptions and payments
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default SubscriptionScreen;