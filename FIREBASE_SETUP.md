# Firebase Setup Instructions

## Firestore Security Rules

The app requires proper Firestore security rules to function correctly. Follow these steps to deploy the rules:

### For Development (Testing Only)

1. Install Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```
   firebase init
   ```
   - Select Firestore when prompted for features
   - Choose your Firebase project

4. Deploy the development rules (allows all operations - NOT SECURE):
   ```
   firebase deploy --only firestore:rules -r firestore.rules.dev
   ```

### For Production

When you're ready to deploy to production, use the secure rules:

```
firebase deploy --only firestore:rules -r firestore.rules
```

## Authentication Setup

1. In the Firebase console, go to Authentication > Sign-in method
2. Enable Email/Password authentication

## Database Structure

The app uses the following Firestore collections:

- `users`: Stores user profile information
  - Document ID: User's Firebase Auth UID
  - Fields: email, displayName, photoURL, isPremium, createdAt, updatedAt

- `userNotes`: Example collection for user-specific data
  - Document ID: Auto-generated
  - Fields: userId, title, content, createdAt, updatedAt

## Troubleshooting

If you encounter permission errors:

1. Check that you've deployed the Firestore rules
2. Verify that the user is properly authenticated
3. Ensure the userId in the document matches the authenticated user's ID
4. For testing, you can temporarily use the development rules