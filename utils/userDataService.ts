import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { User } from '@/types';
import { validateUserData, prepareUserDataForFirestore } from './firestore';
import { getDocument, updateDocument, validateCurrentUser } from './firestoreOperations';

/**
 * Service for managing user data in Firestore
 */
class UserDataService {
  /**
   * Get user data from Firestore
   * @param userId The user ID to fetch data for
   * @returns The user data or null if not found
   */
  async getUserData(userId: string): Promise<User | null> {
    try {
      // Use the getDocument utility function
      const userData = await getDocument<Record<string, any>>('users', userId);
      
      if (!userData) {
        return null;
      }

      return validateUserData(userData);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Get current user data from Firestore
   * @returns The current user data or null if not authenticated
   */
  async getCurrentUserData(): Promise<User | null> {
    try {
      const userId = validateCurrentUser();
      return this.getUserData(userId);
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  }

  /**
   * Update user data in Firestore
   * @param userId The user ID to update
   * @param userData The user data to update
   * @returns The updated user data
   */
  async updateUserData(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      // Validate that the current user is updating their own data
      const currentUserId = validateCurrentUser();
      if (currentUserId !== userId) {
        throw new Error('You can only update your own user data');
      }

      const firestoreData = prepareUserDataForFirestore(userData);
      
      // Use the updateDocument utility function
      const success = await updateDocument('users', userId, firestoreData);
      
      if (!success) {
        return null;
      }

      return this.getUserData(userId);
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  }

  /**
   * Update current user data in Firestore
   * @param userData The user data to update
   * @returns The updated user data
   */
  async updateCurrentUserData(userData: Partial<User>): Promise<User | null> {
    try {
      const userId = validateCurrentUser();
      return this.updateUserData(userId, userData);
    } catch (error) {
      console.error('Error updating current user data:', error);
      return null;
    }
  }
}

export const userDataService = new UserDataService();