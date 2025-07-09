import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FAB, Card, Text, Avatar, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { AppDispatch, RootState } from '@/store';
import { fetchGroups, setCurrentGroup } from '@/store/slices/groupsSlice';
import { MainStackParamList, MainTabParamList } from '@/navigation/MainNavigator';
import { Group } from '@/types';
import { spacing } from '@/constants/theme';

type GroupsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'GroupsTab'>,
  StackNavigationProp<MainStackParamList>
>;

interface Props {
  navigation: GroupsScreenNavigationProp;
}

const GroupsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups, loading } = useSelector((state: RootState) => state.groups);
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    if (user) {
      dispatch(fetchGroups(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = () => {
    if (user) {
      dispatch(fetchGroups(user.id));
    }
  };

  const handleGroupPress = (group: Group) => {
    dispatch(setCurrentGroup(group));
    navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const renderGroupItem = ({ item: group }: { item: Group }) => (
    <Card
      style={styles.groupCard}
      onPress={() => handleGroupPress(group)}
    >
      <Card.Content>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Avatar.Text
              size={40}
              label={group.name.charAt(0)}
              style={{ backgroundColor: colors.primary }}
            />
            <View style={styles.groupDetails}>
              <Text variant="titleMedium">{group.name}</Text>
              <Text variant="bodySmall" style={{ color: colors.text }}>
                {group.members.length} members
              </Text>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => handleGroupPress(group)}
          />
        </View>
        {group.description && (
          <Text variant="bodySmall" style={[styles.description, { color: colors.text }]}>
            {group.description}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={{ color: colors.text }}>
              No Groups Yet
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: colors.text }]}>
              Create your first group to start tracking expenses with friends
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateGroup')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  groupCard: {
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  description: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
  },
});

export default GroupsScreen;