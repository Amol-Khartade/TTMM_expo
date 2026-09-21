import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged as fbOnAuthStateChanged,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { User } from '@/types';
import { sanitizeForFirestore } from '@/utils/firestoreUtils';

class AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    return this.signInWithEmail(email, password);
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await fbUpdateProfile(firebaseUser, { displayName });

      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
      };

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);

      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (error: any) {
      if (
        error?.code === 'auth/no-current-user' ||
        error?.message?.includes('no-current-user')
      ) {
        return;
      }
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const updatedData = sanitizeForFirestore({
        ...userData,
        updatedAt: new Date(),
      });

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, updatedData);

      const userDoc = await getDoc(userDocRef);
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    return this.signUpWithEmail(email, password, displayName);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    const auth = getAuth();
    const db = getFirestore();
    return fbOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
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