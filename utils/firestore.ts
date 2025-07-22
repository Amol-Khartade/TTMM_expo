import { User } from '@/types';

export const validateUserData = (data: any): User | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const { id, email, displayName, photoURL, isPremium, createdAt, updatedAt, password } = data;

  // Validate required fields
  if (!id || typeof id !== 'string') {
    console.error('Invalid user data: missing or invalid id');
    return null;
  }

  if (!email || typeof email !== 'string') {
    console.error('Invalid user data: missing or invalid email');
    return null;
  }

  if (!displayName || typeof displayName !== 'string') {
    console.error('Invalid user data: missing or invalid displayName');
    return null;
  }

  if (typeof isPremium !== 'boolean') {
    console.error('Invalid user data: missing or invalid isPremium');
    return null;
  }

  // Validate optional fields
  if (photoURL !== undefined && typeof photoURL !== 'string') {
    console.error('Invalid user data: invalid photoURL');
    return null;
  }

  // Convert Firestore timestamps to Date objects
  let createdAtDate: Date;
  let updatedAtDate: Date;

  try {
    if (createdAt && typeof createdAt.toDate === 'function') {
      createdAtDate = createdAt.toDate();
    } else if (createdAt instanceof Date) {
      createdAtDate = createdAt;
    } else {
      createdAtDate = new Date(createdAt);
    }

    if (updatedAt && typeof updatedAt.toDate === 'function') {
      updatedAtDate = updatedAt.toDate();
    } else if (updatedAt instanceof Date) {
      updatedAtDate = updatedAt;
    } else {
      updatedAtDate = new Date(updatedAt);
    }
  } catch (error) {
    console.error('Invalid user data: invalid timestamp format', error);
    return null;
  }

  return {
    id,
    email,
    displayName,
    photoURL: photoURL || undefined,
    isPremium,
    createdAt: createdAtDate,
    updatedAt: updatedAtDate,
    password: password || undefined,
  };
};

export const prepareUserDataForFirestore = (userData: Partial<User>): Record<string, any> => {
  const prepared: Record<string, any> = {};

  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined) {
      prepared[key] = value;
    }
  });

  return prepared;
};

export class FirestoreError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export const handleFirestoreError = (error: any): never => {
  console.error('Firestore error:', error);
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        throw new FirestoreError('Access denied. Please check your permissions.', error.code);
      case 'not-found':
        throw new FirestoreError('Document not found.', error.code);
      case 'already-exists':
        throw new FirestoreError('Document already exists.', error.code);
      case 'resource-exhausted':
        throw new FirestoreError('Service temporarily unavailable. Please try again later.', error.code);
      case 'invalid-argument':
        throw new FirestoreError('Invalid data provided.', error.code);
      case 'unavailable':
        throw new FirestoreError('Service temporarily unavailable. Please try again later.', error.code);
      default:
        throw new FirestoreError(error.message || 'Database operation failed.', error.code);
    }
  }
  
  throw new FirestoreError(error.message || 'Database operation failed.');
};