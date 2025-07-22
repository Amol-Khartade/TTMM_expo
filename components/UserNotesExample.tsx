import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { userDataExampleService } from '@/services/userDataExampleService';
import { spacing } from '@/constants/theme';

interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: any;
}

/**
 * Example component that demonstrates using userId for validation
 * when saving and retrieving data from Firestore
 */
const UserNotesExample: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { colors } = useSelector((state: RootState) => state.theme);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user notes
  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userNotes = await userDataExampleService.getUserNotes();
      setNotes(userNotes);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await userDataExampleService.createNote(title.trim(), content.trim());
      setTitle('');
      setContent('');
      loadNotes(); // Reload notes after creating
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
      setLoading(false);
    }
  };

  // Delete a note
  const deleteNote = async (noteId?: string) => {
    if (!noteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await userDataExampleService.deleteNote(noteId);
      loadNotes(); // Reload notes after deleting
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
      setLoading(false);
    }
  };

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, [user?.id]);

  if (!user) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>Please log in to use this feature</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="User Notes Example" subtitle="Using userId for validation" />
      <Card.Content>
        <Text style={styles.description}>
          This example demonstrates saving and retrieving data with user validation.
          Each note is associated with your userId and can only be accessed by you.
        </Text>
        
        {/* Note creation form */}
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={3}
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={createNote}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Add Note
        </Button>
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        {/* Notes list */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Your Notes:</Text>
          {loading && !notes.length ? (
            <ActivityIndicator style={styles.loader} />
          ) : notes.length === 0 ? (
            <Text style={styles.emptyText}>No notes yet. Create one above!</Text>
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item) => item.id || ''}
              renderItem={({ item }) => (
                <Card style={styles.noteCard}>
                  <Card.Title
                    title={item.title}
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="delete"
                        onPress={() => deleteNote(item.id)}
                      />
                    )}
                  />
                  <Card.Content>
                    <Text>{item.content}</Text>
                  </Card.Content>
                </Card>
              )}
            />
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={loadNotes} loading={loading} disabled={loading}>
          Refresh Notes
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
  },
  description: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  error: {
    color: 'red',
    marginBottom: spacing.md,
  },
  notesContainer: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  noteCard: {
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.md,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default UserNotesExample;