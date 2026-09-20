export default {
  expo: {
    name: 'TTMM',
    slug: 'ttmm',
    owner: 'amolkhartade97',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ttmm',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    updates: {
      url: 'https://u.expo.dev/bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ttmm.app',
      googleServicesFile: './GoogleService-Info.plist',
      runtimeVersion: {
        policy: 'appVersion',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
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
      'expo-image',
      'expo-status-bar',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        '@react-native-firebase/app',
        {
          android: {
            googleServicesFile: './google-services.json',
          },
          ios: {
            googleServicesFile: './GoogleService-Info.plist',
          },
        },
      ],
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
        projectId: 'bbd3d1f1-0898-40d4-9d0a-a9a8f78a07e0',
      },
    },
  },
};
