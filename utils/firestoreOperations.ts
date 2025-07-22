import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FirestoreError, handleFirestoreError } from './firestore';
import { retry } from './retry';

/**
 * Validates if the current user is authorized to perform operations
 * @returns The current user ID if authorized, throws error otherwise
 */
export const validateCurrentUser = (): string => {
  const currentUser = auth().currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new FirestoreError('User not authenticated', 'unauthenticated');
  }
  return currentUser.uid;
};

/**
 * Creates a document in Firestore with user validation
 * @param collection Collection name
 * @param data Document data
 * @param docId Optional document ID (uses auto-generated ID if not provided)
 * @returns The document ID
 */
export const createDocument = async <T extends Record<string, any>>(
  collection: string,
  data: T,
  docId?: string
): Promise<string> => {
  try {
    const userId = validateCurrentUser();
    
    // Add userId to the data for ownership tracking
    const dataWithUser = {
      ...data,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    let documentRef;
    
    if (docId) {
      documentRef = firestore().collection(collection).doc(docId);
      await retry(() => documentRef.set(dataWithUser));
    } else {
      documentRef = await retry(() => 
        firestore().collection(collection).add(dataWithUser)
      );
    }
    
    return documentRef.id;
  } catch (error) {
    return handleFirestoreError(error);
  }
};

/**
 * Updates a document in Firestore with user validation
 * @param collection Collection name
 * @param docId Document ID
 * @param data Document data to update
 * @param requireOwnership Whether to require the current user to be the owner
 * @returns True if update was successful
 */
export const updateDocument = async <T extends Record<string, any>>(
  collection: string,
  docId: string,
  data: Partial<T>,
  requireOwnership = true
): Promise<boolean> => {
  try {
    const userId = validateCurrentUser();
    
    // If ownership is required, verify the user owns this document
    if (requireOwnership) {
      const doc = await retry(() => firestore().collection(collection).doc(docId).get());
      
      if (!doc.exists) {
        throw new FirestoreError('Document not found', 'not-found');
      }
      
      const docData = doc.data();
      if (docData?.userId !== userId) {
        throw new FirestoreError('You do not have permission to update this document', 'permission-denied');
      }
    }
    
    // Add updatedAt timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    await retry(() => 
      firestore().collection(collection).doc(docId).update(dataWithTimestamp)
    );
    
    return true;
  } catch (error) {
    return handleFirestoreError(error);
  }
};

/**
 * Gets a document from Firestore with optional user validation
 * @param collection Collection name
 * @param docId Document ID
 * @param requireOwnership Whether to require the current user to be the owner
 * @returns The document data or null if not found
 */
export const getDocument = async <T>(
  collection: string,
  docId: string,
  requireOwnership = false
): Promise<T | null> => {
  try {
    const userId = validateCurrentUser();
    
    const doc = await retry(() => 
      firestore().collection(collection).doc(docId).get()
    );
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data() as T & { userId?: string };
    
    // If ownership is required, verify the user owns this document
    if (requireOwnership && data.userId !== userId) {
      throw new FirestoreError('You do not have permission to access this document', 'permission-denied');
    }
    
    return data as T;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};

/**
 * Deletes a document from Firestore with user validation
 * @param collection Collection name
 * @param docId Document ID
 * @param requireOwnership Whether to require the current user to be the owner
 * @returns True if deletion was successful
 */
export const deleteDocument = async (
  collection: string,
  docId: string,
  requireOwnership = true
): Promise<boolean> => {
  try {
    const userId = validateCurrentUser();
    
    // If ownership is required, verify the user owns this document
    if (requireOwnership) {
      const doc = await retry(() => firestore().collection(collection).doc(docId).get());
      
      if (!doc.exists) {
        throw new FirestoreError('Document not found', 'not-found');
      }
      
      const docData = doc.data();
      if (docData?.userId !== userId) {
        throw new FirestoreError('You do not have permission to delete this document', 'permission-denied');
      }
    }
    
    await retry(() => 
      firestore().collection(collection).doc(docId).delete()
    );
    
    return true;
  } catch (error) {
    return handleFirestoreError(error);
  }
};

/**
 * Gets documents from Firestore with optional user validation
 * @param collection Collection name
 * @param userOnly Whether to only return documents owned by the current user
 * @param limit Maximum number of documents to return (optional)
 * @returns Array of documents
 */
export const getDocuments = async <T>(
  collection: string,
  userOnly = false,
  limit?: number
): Promise<T[]> => {
  try {
    const userId = validateCurrentUser();
    
    let query = firestore().collection(collection);
    
    // If userOnly is true, only return documents owned by the current user
    if (userOnly) {
      query = query.where('userId', '==', userId);
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await retry(() => query.get());
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
};