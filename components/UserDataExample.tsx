import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { userDataService } from '@/utils/userDataService';
import { User } from '@/types';

/**
 * Example component that demonstrates how to retrieve and display user data from Firestore
 */
const UserDataExample: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await userDataService.getUserData(user.id);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  if (!user) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>Please log in to view your data</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="User Data from Firestore" />
      <Card.Content>
        {loading ? (
          <Text>Loading user data...</Text>
        ) : userData ? (
          <View>
            <Text style={styles.field}>User ID: {userData.id}</Text>
            <Text style={styles.field}>Email: {userData.email}</Text>
            <Text style={styles.field}>Display Name: {userData.displayName}</Text>
            {userData.password && (
              <Text style={styles.field}>
                Password: {userData.password.substring(0, 3)}****** (stored for demo purposes only)
              </Text>
            )}
            <Text style={styles.field}>
              Account Created: {userData.createdAt.toLocaleDateString()}
            </Text>
            <Text style={styles.field}>
              Last Updated: {userData.updatedAt.toLocaleDateString()}
            </Text>
          </View>
        ) : (
          <Text>No user data found</Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button onPress={fetchUserData} loading={loading}>
          Refresh Data
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  field: {
    marginBottom: 8,
  },
});

export default UserDataExample;