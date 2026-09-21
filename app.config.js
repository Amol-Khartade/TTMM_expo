export default {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || 'TTMM',
    slug: 'ttmm',
    owner: 'amolkhartade97',
    version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || 'ttmm',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EAS_PROJECT_ID || 'bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0'}`,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ttmm.app',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME ||
                'com.googleusercontent.apps.490411406261-jcv6h9c36rcujdbs89m7firg1r6s7se3',
            ],
          },
        ],
      },
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.ttmm.app',
      googleServicesFile: './google-services.json',
      runtimeVersion: '1.0.0',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-status-bar',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      [
        '@react-native-firebase/messaging',
        {
          iOS: {
            useFramework: 'static',
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId:
          process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
          process.env.EAS_PROJECT_ID ||
          'bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0',
      },
    },
  },
};
