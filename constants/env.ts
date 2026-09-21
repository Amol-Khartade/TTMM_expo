/**
 * Centralized Application Environment & Configuration
 * Provides typed access to process.env (EXPO_PUBLIC_* variables in Expo) with safe fallbacks.
 */

export const ENV = {
  // Application
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'TTMM',
  APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME || 'ttmm',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  IS_DEV: (process.env.EXPO_PUBLIC_APP_ENV || 'development') === 'development',
  IS_PROD: process.env.EXPO_PUBLIC_APP_ENV === 'production',

  // Firebase Configuration
  FIREBASE: {
    PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ttmm-6b629',
    PROJECT_NUMBER: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_NUMBER || '490411406261',
    STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ttmm-6b629.firebasestorage.app',
    AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ttmm-6b629.firebaseapp.com',
    API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDvMOD2urSRo5i3qv90U9WNwW3scyCl6KA',
    ANDROID_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY || 'AIzaSyDvMOD2urSRo5i3qv90U9WNwW3scyCl6KA',
    ANDROID_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_APP_ID || '1:490411406261:android:a48c191cf2df04f773dffc',
    IOS_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_IOS_API_KEY || 'AIzaSyC20FgGL2rCFbAHqgOg5ioUBFK2LKL9ciU',
    IOS_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_IOS_APP_ID || '1:490411406261:ios:c320994034cc69cd73dffc',
  },

  // Google OAuth & Sign-in
  GOOGLE_AUTH: {
    WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '490411406261-jcv6h9c36rcujdbs89m7firg1r6s7se3.apps.googleusercontent.com',
    IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '490411406261-jcv6h9c36rcujdbs89m7firg1r6s7se3.apps.googleusercontent.com',
    IOS_URL_SCHEME: process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME || 'com.googleusercontent.apps.490411406261-jcv6h9c36rcujdbs89m7firg1r6s7se3',
  },

  // EAS / Expo Project Services
  EAS: {
    PROJECT_ID: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EAS_PROJECT_ID || 'bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0',
  },

  // App Feature Flags & Regional Defaults
  DEFAULTS: {
    CURRENCY: process.env.EXPO_PUBLIC_DEFAULT_CURRENCY || 'INR',
    TRANSACTION_NOTE: process.env.EXPO_PUBLIC_DEFAULT_TRANSACTION_NOTE || 'TTMM Settlement',
  },
  FEATURES: {
    SIMPLIFIED_DEBTS: process.env.EXPO_PUBLIC_ENABLE_SIMPLIFIED_DEBTS !== 'false',
    PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false',
  },
} as const;

export type AppEnv = typeof ENV;
