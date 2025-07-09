export default {
  expo: {
    name: 'TTMM',
    slug: 'ttmm',
    owner: 'amolkhartade',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ttmm',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ttmm.app',
      googleServicesFile: './GoogleService-Info.plist',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.ttmm.app',
      googleServicesFile: './google-services.json',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
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
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: '73363ff8-6333-4f59-a6cc-85d452430185',
      },
    },
  },
};
