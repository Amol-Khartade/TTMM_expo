import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useSelector, useDispatch } from 'react-redux';

import { store, persistor, RootState, AppDispatch } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { lightTheme, darkTheme } from '@/constants/theme';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';

import AppNavigator from '@/navigation/AppNavigator';
import LoadingScreen from '@/screens/LoadingScreen';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      dispatch(setUser(user));
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await notificationService.requestPermission();
      if (hasPermission && user) {
        const token = await notificationService.getToken();
        if (token) {
          await notificationService.updateUserToken(user.id, token);
        }
      }
    };

    if (user) {
      initializeNotifications();
    }

    const unsubscribe = notificationService.setupMessageListener();
    return unsubscribe;
  }, [user]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <AppNavigator />
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;