import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { List, Avatar, Switch, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

import { AppDispatch, RootState } from '@/store';
import { signOut } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { MainStackParamList, MainTabParamList } from '@/navigation/MainNavigator';
import { spacing } from '@/constants/theme';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
  StackNavigationProp<MainStackParamList>
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark, colors } = useSelector((state: RootState) => state.theme);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(signOut()),
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.displayName.charAt(0)}
          style={{ backgroundColor: colors.primary }}
        />
        <List.Item
          title={user.displayName}
          description={user.email}
          titleStyle={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}
          descriptionStyle={{ textAlign: 'center' }}
        />
        {user.isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
            <List.Item
              title="Premium Member"
              titleStyle={{ color: 'white', textAlign: 'center', fontSize: 12 }}
            />
          </View>
        )}
      </View>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="Notifications"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigation.navigate('Notifications')}
        />
        <List.Item
          title="Premium Subscription"
          description={user.isPremium ? 'Active' : 'Upgrade to Premium'}
          left={(props) => <List.Icon {...props} icon="crown" />}
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigation.navigate('Subscription')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Settings</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDark}
              onValueChange={() => dispatch(toggleTheme())}
            />
          )}
        />
      </List.Section>

      <Divider />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          buttonColor={colors.error}
          textColor={colors.error}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  premiumBadge: {
    borderRadius: 20,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  footer: {
    padding: spacing.xl,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
});

export default ProfileScreen;