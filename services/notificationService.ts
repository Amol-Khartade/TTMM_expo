import messaging from '@react-native-firebase/messaging';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from '@react-native-firebase/firestore';
import { Notification } from '@/types';
import { sanitizeForFirestore } from '@/utils/firestoreUtils';

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
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
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
      const db = getFirestore();
      const notification: Omit<Notification, 'id'> = {
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        read: false,
        createdAt: new Date(),
      };

      const cleanNotification = sanitizeForFirestore(notification);
      const notificationsCol = collection(db, 'notifications');
      await addDoc(notificationsCol, cleanNotification);

      console.log(`Notification created for user ${userId}: ${notificationData.title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const db = getFirestore();
      const notificationsCol = collection(db, 'notifications');
      const q = query(notificationsCol, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const notifications = snapshot.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];

      notifications.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return notifications.slice(0, 50);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async markAsRead(notificationId: string): Promise<string> {
    try {
      const db = getFirestore();
      const notificationDocRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationDocRef, { read: true });

      return notificationId;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const db = getFirestore();
      const batch = writeBatch(db);
      const notificationsCol = collection(db, 'notifications');
      const q = query(
        notificationsCol,
        where('userId', '==', userId),
        where('read', '==', false),
      );
      const snapshot = await getDocs(q);

      snapshot.docs.forEach((d: any) => {
        batch.update(d.ref, { read: true });
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