import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User } from '@/types';
import { validateAuthInputs } from '@/utils/validation';
import { validateUserData, prepareUserDataForFirestore, handleFirestoreError } from '@/utils/firestore';
import { retry } from '@/utils/retry';

class AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      // Validate inputs
      const validation = validateAuthInputs(email, password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const { email: cleanEmail, password: cleanPassword } = validation.sanitizedData;
      
      const userCredential = await auth().signInWithEmailAndPassword(cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Authentication failed: No user returned');
      }

      try {
        const userDoc = await retry(() => 
          firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get()
        );
        
        if (!userDoc.exists) {
          // If user document doesn't exist, create a user profile
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || email.split('@')[0],
            isPremium: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: firebaseUser.uid
          };
          
          // Save user data to Firestore
          try {
            const firestoreData = prepareUserDataForFirestore(userData);
            await retry(() => 
              firestore()
                .collection('users')
                .doc(firebaseUser.uid)
                .set({
                  ...firestoreData,
                  userId: firebaseUser.uid,
                  createdAt: firestore.FieldValue.serverTimestamp(),
                  updatedAt: firestore.FieldValue.serverTimestamp()
                })
            );
            
            // Also create user preferences document
            await retry(() =>
              firestore()
                .collection('userPreferences')
                .doc(firebaseUser.uid)
                .set({
                  userId: firebaseUser.uid,
                  theme: 'light',
                  notifications: true,
                  language: 'en',
                  createdAt: firestore.FieldValue.serverTimestamp(),
                  updatedAt: firestore.FieldValue.serverTimestamp()
                })
            );
            
            // Log user activity
            await retry(() =>
              firestore()
                .collection('userActivity')
                .add({
                  userId: firebaseUser.uid,
                  action: 'login',
                  timestamp: firestore.FieldValue.serverTimestamp(),
                  details: { method: 'email' }
                })
            );
            
            return userData;
          } catch (writeError) {
            console.warn('Failed to save user data during login:', writeError);
            // Continue with authentication even if Firestore write fails
            return userData;
          }
        }

        const userData = validateUserData(userDoc.data());
        if (!userData) {
          throw new Error('Invalid user data in database');
        }
        
        // Update last login timestamp
        try {
          await retry(() =>
            firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .update({
                lastLoginAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp()
              })
          );
          
          // Log user activity
          await retry(() =>
            firestore()
              .collection('userActivity')
              .add({
                userId: firebaseUser.uid,
                action: 'login',
                timestamp: firestore.FieldValue.serverTimestamp(),
                details: { method: 'email' }
              })
          );
        } catch (updateError) {
          console.warn('Failed to update last login timestamp:', updateError);
          // Continue even if update fails
        }
        
        return userData;
      } catch (firestoreError: any) {
        // If there's a permission error, return minimal user data
        if (firestoreError.code === 'permission-denied') {
          console.warn('Firestore permission denied, using minimal user data');
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || email.split('@')[0],
            isPremium: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: firebaseUser.uid
          };
        }
        
        // For other errors, rethrow
        throw firestoreError;
      }
    } catch (error: any) {
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new Error('No account found with this email address');
          case 'auth/wrong-password':
            throw new Error('Invalid password');
          case 'auth/user-disabled':
            throw new Error('This account has been disabled');
          case 'auth/too-many-requests':
            throw new Error('Too many login attempts. Please try again later');
          case 'auth/invalid-email':
            throw new Error('Invalid email address');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your connection');
          default:
            return handleFirestoreError(error);
        }
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      // Validate inputs
      const validation = validateAuthInputs(email, password, displayName);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const { email: cleanEmail, password: cleanPassword, displayName: cleanDisplayName } = validation.sanitizedData;
      
      const userCredential = await auth().createUserWithEmailAndPassword(cleanEmail, cleanPassword);
      const firebaseUser = userCredential.user;
      
      if (!firebaseUser) {
        throw new Error('Account creation failed: No user returned');
      }

      // Critical fix: Check for null email before using it
      if (!firebaseUser.email) {
        throw new Error('Account creation failed: No email address provided');
      }

      await firebaseUser.updateProfile({ displayName: cleanDisplayName });
      
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: cleanDisplayName!,
        photoURL: firebaseUser.photoURL || undefined,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        // For demonstration only - in a real app, never store passwords in Firestore
        password: cleanPassword,
      };
      
      // Save all user data to Firestore using the user's ID as the document ID
      try {
        // 1. Save main user document
        const firestoreData = prepareUserDataForFirestore(userData);
        await retry(() => 
          firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .set({
              ...firestoreData,
              // Add userId field explicitly for consistency with other collections
              userId: firebaseUser.uid,
              createdAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp(),
              lastLoginAt: firestore.FieldValue.serverTimestamp(),
              registrationDate: firestore.FieldValue.serverTimestamp()
            })
        );
        
        // 2. Create user preferences document
        await retry(() =>
          firestore()
            .collection('userPreferences')
            .doc(firebaseUser.uid)
            .set({
              userId: firebaseUser.uid,
              theme: 'light',
              notifications: true,
              language: 'en',
              createdAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp()
            })
        );
        
        // 3. Create additional user data document
        await retry(() =>
          firestore()
            .collection('userData')
            .doc(firebaseUser.uid)
            .set({
              userId: firebaseUser.uid,
              bio: '',
              phoneNumber: '',
              address: '',
              birthdate: null,
              accountStatus: 'active',
              createdAt: firestore.FieldValue.serverTimestamp(),
              updatedAt: firestore.FieldValue.serverTimestamp()
            })
        );
        
        // 4. Log user activity
        await retry(() =>
          firestore()
            .collection('userActivity')
            .add({
              userId: firebaseUser.uid,
              action: 'signup',
              timestamp: firestore.FieldValue.serverTimestamp(),
              details: { method: 'email' }
            })
        );
        
      } catch (firestoreError) {
        console.warn('Failed to save user data to Firestore:', firestoreError);
        // Continue with authentication even if Firestore write fails
        // This allows the user to sign up even if Firestore rules are restrictive
      }
      
      return userData;
    } catch (error: any) {
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            throw new Error('An account with this email already exists');
          case 'auth/invalid-email':
            throw new Error('Invalid email address');
          case 'auth/weak-password':
            throw new Error('Password is too weak. Please choose a stronger password');
          case 'auth/operation-not-allowed':
            throw new Error('Account creation is currently disabled');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your connection');
          default:
            return handleFirestoreError(error);
        }
      }
      throw new Error(error.message || 'Account creation failed');
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

      // Use type-safe Firestore operation
      const firestoreData = prepareUserDataForFirestore(updatedData);
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update(firestoreData);

      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (!userDoc.exists) {
        throw new Error('User data not found in database');
      }

      const validatedUserData = validateUserData(userDoc.data());
      if (!validatedUserData) {
        throw new Error('Invalid user data in database');
      }

      return validatedUserData;
    } catch (error: any) {
      return handleFirestoreError(error);
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

      if (!userDoc.exists) {
        return null;
      }

      const validatedUserData = validateUserData(userDoc.data());
      return validatedUserData;
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
            const validatedUserData = validateUserData(userDoc.data());
            callback(validatedUserData);
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