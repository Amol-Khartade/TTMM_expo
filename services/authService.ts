import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '@/types';

class AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      const userDoc = await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .get();
      
      if (userDoc.exists) {
        return userDoc.data() as User;
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      
      await firebaseUser.updateProfile({ displayName });
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || undefined,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .set(userData);
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const updatedData = {
        ...userData,
        updatedAt: new Date(),
      };

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update(updatedData);

      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return null;
      }

      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        return userDoc.data() as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();
          
          if (userDoc.exists) {
            callback(userDoc.data() as User);
          } else {
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();