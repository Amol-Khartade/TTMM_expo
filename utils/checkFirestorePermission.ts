import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface PermissionCheckResult {
  hasPermission: boolean;
  collections: {
    [collection: string]: {
      read: boolean;
      write: boolean;
      error?: string;
    };
  };
}

/**
 * Checks if the current user has permission to write to Firestore
 * @returns Promise that resolves to true if the user has permission, false otherwise
 */
export const checkFirestorePermission = async (): Promise<boolean> => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return false;
    }

    // Try to write to a temporary document
    const tempDocRef = firestore()
      .collection('_permissions_check')
      .doc(currentUser.uid);
    
    await tempDocRef.set({
      timestamp: firestore.FieldValue.serverTimestamp(),
      userId: currentUser.uid
    });
    
    // If we get here, the write was successful
    
    // Clean up the temporary document
    await tempDocRef.delete();
    
    return true;
  } catch (error) {
    console.warn('Firestore permission check failed:', error);
    return false;
  }
};

/**
 * Checks permissions for specific collections
 * @returns Promise that resolves to a detailed permission check result
 */
export const checkDetailedPermissions = async (): Promise<PermissionCheckResult> => {
  const currentUser = auth().currentUser;
  if (!currentUser) {
    return {
      hasPermission: false,
      collections: {}
    };
  }
  
  const userId = currentUser.uid;
  const result: PermissionCheckResult = {
    hasPermission: false,
    collections: {}
  };
  
  // Collections to check
  const collectionsToCheck = ['users', 'userData', 'userPreferences', 'userActivity'];
  
  for (const collection of collectionsToCheck) {
    result.collections[collection] = {
      read: false,
      write: false
    };
    
    // Check read permission
    try {
      await firestore()
        .collection(collection)
        .doc(userId)
        .get();
      
      result.collections[collection].read = true;
    } catch (error: any) {
      result.collections[collection].read = false;
      result.collections[collection].error = error.message;
    }
    
    // Check write permission
    try {
      const docRef = firestore()
        .collection(collection)
        .doc(userId);
      
      await docRef.set({
        userId,
        timestamp: firestore.FieldValue.serverTimestamp(),
        _test: true
      }, { merge: true });
      
      // Clean up test data
      await docRef.update({
        _test: firestore.FieldValue.delete()
      });
      
      result.collections[collection].write = true;
    } catch (error: any) {
      result.collections[collection].write = false;
      result.collections[collection].error = error.message;
    }
  }
  
  // Overall permission is true if at least users collection has read/write access
  result.hasPermission = result.collections.users?.read && result.collections.users?.write;
  
  return result;
};

/**
 * Shows a warning message about Firestore permissions
 */
export const getFirestorePermissionMessage = (): string => {
  return 'Firestore write permission denied. Please check your Firebase security rules. ' +
    'See FIREBASE_SETUP.md for instructions on how to deploy the correct rules.';
};

/**
 * Deploys the updated Firestore rules
 * @returns Promise that resolves when rules are deployed
 */
export const deployFirestoreRules = async (): Promise<void> => {
  try {
    // This function would typically be implemented in a server-side environment
    // or using Firebase Admin SDK, which is not available in client apps
    console.warn('deployFirestoreRules must be run from a server or CI/CD pipeline');
    
    // For client-side apps, provide instructions instead
    console.info('To deploy Firestore rules, run: npm run deploy-firestore-rules');
  } catch (error) {
    console.error('Failed to deploy Firestore rules:', error);
    throw error;
  }
};