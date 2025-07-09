import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Notification } from '@/types';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async updateUserToken(userId: string, token: string): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          fcmToken: token,
          updatedAt: new Date(),
        });
    } catch (error) {
      console.error('Error updating user token:', error);
    }
  }

  async sendNotification(userId: string, notificationData: {
    type: 'expense_added' | 'member_added' | 'settlement_request' | 'group_closed';
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        read: false,
        createdAt: new Date(),
      };

      await firestore().collection('notifications').add(notification);

      const userDoc = await firestore().collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData?.fcmToken) {
        const message = {
          token: userData.fcmToken,
          notification: {
            title: notificationData.title,
            body: notificationData.message,
          },
          data: notificationData.data ? JSON.stringify(notificationData.data) : '{}',
        };

        try {
          await messaging().send(message);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async markAsRead(notificationId: string): Promise<string> {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({ read: true });
      
      return notificationId;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const batch = firestore().batch();
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  setupMessageListener(): () => void {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background:', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);
        }
      });

    return unsubscribe;
  }
}

export const notificationService = new NotificationService();