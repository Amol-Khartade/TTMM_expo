# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native expense tracking app ("TTMM") built with Expo, featuring group expense management, user authentication, and push notifications. The app uses Firebase for backend services and Redux for state management.

## Development Commands

Start the development server:
```bash
npm start
# or
expo start
```

Platform-specific development:
```bash
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser
```

Code quality:
```bash
npm run lint       # Run ESLint
```

Reset project to clean state:
```bash
npm run reset-project
```

## Architecture

### State Management
- **Redux Toolkit** with Redux Persist for state management
- Store configuration in `store/index.ts`
- Slices: `auth`, `groups`, `expenses`, `notifications`, `theme`
- Persisted slices: `auth` and `theme` (using AsyncStorage)

### Navigation Structure
- **AppNavigator** (`navigation/AppNavigator.tsx`): Root navigator with authentication routing
- **AuthNavigator**: Handles login/signup flows
- **MainNavigator**: Main app navigation after authentication
- Uses React Navigation v7 with Stack Navigator

### Authentication Flow
- Firebase Authentication integrated via `@react-native-firebase/auth`
- **AuthService** (`services/authService.ts`): Handles sign-in, sign-up, profile updates
- User data stored in Firestore (`users` collection)
- Authentication state managed in Redux (`authSlice`)

### Firebase Integration
- **Firestore**: User data, groups, expenses storage
- **Firebase Auth**: User authentication
- **Firebase Messaging**: Push notifications
- **Firebase Analytics**: App analytics

### UI/Theming
- **React Native Paper**: Material Design components
- **Custom theme system**: Light/dark themes in `constants/theme.ts`
- Theme state managed in Redux (`themeSlice`)

### Core Features
- **Groups**: Create/manage expense groups (`groupsSlice`, `groupsService`)
- **Expenses**: Add/track expenses (`expensesSlice`, `expensesService`)
- **Notifications**: Push notifications (`notificationsSlice`, `notificationService`)
- **Profile**: User profile management with premium subscriptions

### Key Files
- `App.tsx`: Main app component with providers setup
- `store/index.ts`: Redux store configuration
- `services/`: Business logic services (auth, groups, expenses, notifications)
- `navigation/`: Navigation structure
- `screens/`: Feature screens organized by domain
- `types/index.ts`: TypeScript type definitions

### Development Notes
- Uses TypeScript throughout
- Expo SDK ~53.0.17
- React Native 0.79.5
- File-based routing with Expo Router (in `app/` directory)
- Custom hooks in `hooks/` for theme and color scheme management