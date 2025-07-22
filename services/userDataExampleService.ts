import { 
  createDocument, 
  updateDocument, 
  getDocument, 
  deleteDocument, 
  getDocuments,
  validateCurrentUser
} from '@/utils/firestoreOperations';

// Example user note interface
interface UserNote {
  id?: string;
  userId: string;
  title: string;
  content: string;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Example service that demonstrates using userId for validation
 * when saving and retrieving data from Firestore
 */
class UserDataExampleService {
  private readonly COLLECTION = 'userNotes';

  /**
   * Create a new note for the current user
   * @param title Note title
   * @param content Note content
   * @returns The ID of the created note
   */
  async createNote(title: string, content: string): Promise<string> {
    const userId = validateCurrentUser();
    
    const noteData: UserNote = {
      userId,
      title,
      content
    };
    
    return createDocument(this.COLLECTION, noteData);
  }

  /**
   * Get a note by ID (only if it belongs to the current user)
   * @param noteId Note ID
   * @returns The note data or null if not found
   */
  async getNote(noteId: string): Promise<UserNote | null> {
    return getDocument<UserNote>(this.COLLECTION, noteId, true);
  }

  /**
   * Update a note (only if it belongs to the current user)
   * @param noteId Note ID
   * @param data Updated note data
   * @returns True if update was successful
   */
  async updateNote(noteId: string, data: Partial<UserNote>): Promise<boolean> {
    return updateDocument(this.COLLECTION, noteId, data, true);
  }

  /**
   * Delete a note (only if it belongs to the current user)
   * @param noteId Note ID
   * @returns True if deletion was successful
   */
  async deleteNote(noteId: string): Promise<boolean> {
    return deleteDocument(this.COLLECTION, noteId, true);
  }

  /**
   * Get all notes for the current user
   * @returns Array of notes
   */
  async getUserNotes(): Promise<UserNote[]> {
    return getDocuments<UserNote>(this.COLLECTION, true);
  }
}

export const userDataExampleService = new UserDataExampleService();