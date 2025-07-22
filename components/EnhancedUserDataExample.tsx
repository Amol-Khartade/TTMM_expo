import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { userDataService } from '@/utils/userDataService';
import { User } from '@/types';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { checkDetailedPermissions } from '@/utils/checkFirestorePermission';

interface UserPermissions {
  hasPermission: boolean;
  collections: Record<string, { read: boolean; write: boolean; error?: string }>;
}

/**
 * Enhanced component that demonstrates how to retrieve and display all user data from Firestore
 */
const UserDataExample: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [additionalUserData, setAdditionalUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user data from Firestore
  const loadAllUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check permissions first
      const permissionsResult = await checkDetailedPermissions();
      setPermissions(permissionsResult);
      
      // Load main user data
      const data = await userDataService.getUserData(user.id);
      setUserData(data);
      
      // Only proceed with other collections if we have a user
      if (data) {
        const userId = data.id;
        
        // Load user preferences
        try {
          const prefsDoc = await firestore()
            .collection('userPreferences')
            .doc(userId)
            .get();
            
          if (prefsDoc.exists) {
            setUserPreferences(prefsDoc.data());
          }
        } catch (prefsError) {
          console.warn('Failed to load user preferences:', prefsError);
        }
        
        // Load additional user data
        try {
          const additionalDoc = await firestore()
            .collection('userData')
            .doc(userId)
            .get();
            
          if (additionalDoc.exists) {
            setAdditionalUserData(additionalDoc.data());
          }
        } catch (additionalError) {
          console.warn('Failed to load additional user data:', additionalError);
        }
        
        // Load user activity
        try {
          const activitySnapshot = await firestore()
            .collection('userActivity')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
            
          const activities = activitySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setUserActivity(activities);
        } catch (activityError) {
          console.warn('Failed to load user activity:', activityError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Update user display name
  const updateDisplayName = async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update with a timestamp to see the change
      const newName = `${userData.displayName.split(' ')[0]} ${new Date().toISOString().slice(11, 19)}`;
      
      const updatedData = await userDataService.updateUserData(userData.id, {
        displayName: newName
      });
      
      setUserData(updatedData);
      
      // Log this activity
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('userActivity')
          .add({
            userId: currentUser.uid,
            action: 'update_profile',
            timestamp: firestore.FieldValue.serverTimestamp(),
            details: { field: 'displayName', newValue: newName }
          });
      }
      
      // Refresh all data
      loadAllUserData();
    } catch (err: any) {
      setError(err.message || 'Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      loadAllUserData();
    }
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

  if (loading && !userData) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (error && !userData) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadAllUserData} style={styles.button}>
            Try Again
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <ScrollView>
      <Card style={styles.card}>
        <Card.Title title="User Data from Firestore" />
        <Card.Content>
          {userData ? (
            <View>
              <Text style={styles.sectionTitle}>Main User Data</Text>
              <Text style={styles.field}>User ID: {userData.id}</Text>
              <Text style={styles.field}>Email: {userData.email}</Text>
              <Text style={styles.field}>Display Name: {userData.displayName}</Text>
              <Text style={styles.field}>Premium User: {userData.isPremium ? 'Yes' : 'No'}</Text>
              <Text style={styles.field}>
                Account Created: {userData.createdAt.toLocaleString()}
              </Text>
              <Text style={styles.field}>
                Last Updated: {userData.updatedAt.toLocaleString()}
              </Text>
              
              <Button 
                mode="contained" 
                onPress={updateDisplayName} 
                loading={loading}
                style={styles.button}
              >
                Update Display Name
              </Button>
            </View>
          ) : (
            <Text>No user data found</Text>
          )}
        </Card.Content>
      </Card>

      {userPreferences && (
        <Card style={styles.card}>
          <Card.Title title="User Preferences" />
          <Card.Content>
            {Object.entries(userPreferences).map(([key, value]) => {
              if (key === 'createdAt' || key === 'updatedAt') {
                if (typeof value === 'object' && value && 'toDate' in value) {
                  value = (value as any).toDate().toLocaleString();
                }
              }
              
              return (
                <Text key={key} style={styles.field}>
                  {key}: {String(value)}
                </Text>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {additionalUserData && (
        <Card style={styles.card}>
          <Card.Title title="Additional User Data" />
          <Card.Content>
            {Object.entries(additionalUserData).map(([key, value]) => {
              if (key === 'createdAt' || key === 'updatedAt') {
                if (typeof value === 'object' && value && 'toDate' in value) {
                  value = (value as any).toDate().toLocaleString();
                }
              }
              
              if (value === null) value = 'Not set';
              
              return (
                <Text key={key} style={styles.field}>
                  {key}: {String(value)}
                </Text>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {userActivity.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Recent Activity" />
          <Card.Content>
            {userActivity.map((activity, index) => {
              let timestamp = 'Unknown';
              if (activity.timestamp && typeof activity.timestamp.toDate === 'function') {
                timestamp = activity.timestamp.toDate().toLocaleString();
              }
              
              return (
                <View key={index} style={styles.activityItem}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{timestamp}</Text>
                  {activity.details && (
                    <Text style={styles.activityDetails}>
                      {JSON.stringify(activity.details)}
                    </Text>
                  )}
                  {index < userActivity.length - 1 && <Divider style={styles.divider} />}
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {permissions && (
        <Card style={styles.card}>
          <Card.Title title="Firestore Permissions" />
          <Card.Content>
            <Text style={styles.field}>
              Overall: 
              <Text style={permissions.hasPermission ? styles.success : styles.error}>
                {' '}{permissions.hasPermission ? 'Access Granted' : 'Access Denied'}
              </Text>
            </Text>
            
            {Object.entries(permissions.collections).map(([collection, perms]) => (
              <View key={collection} style={styles.permissionItem}>
                <Text style={styles.permissionCollection}>{collection}</Text>
                <View style={styles.permissionDetails}>
                  <Text>Read: <Text style={perms.read ? styles.success : styles.error}>
                    {perms.read ? 'Yes' : 'No'}
                  </Text></Text>
                  <Text>Write: <Text style={perms.write ? styles.success : styles.error}>
                    {perms.write ? 'Yes' : 'No'}
                  </Text></Text>
                </View>
                {perms.error && <Text style={styles.errorText}>{perms.error}</Text>}
                <Divider style={styles.divider} />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Actions>
          <Button 
            mode="contained" 
            onPress={loadAllUserData} 
            loading={loading}
            style={styles.button}
          >
            Refresh All Data
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  field: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  activityItem: {
    marginBottom: 8,
  },
  activityAction: {
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDetails: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  permissionItem: {
    marginBottom: 8,
  },
  permissionCollection: {
    fontWeight: 'bold',
  },
  permissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  divider: {
    marginVertical: 8,
  },
});

export default UserDataExample;