import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { clearError } from '@/store/slices/authSlice';
import { lightTheme, darkTheme } from '@/constants/theme';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingScreen from '@/screens/LoadingScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  
  const theme = isDark ? darkTheme : lightTheme;

  // Clear any auth errors when navigation changes
  useEffect(() => {
    dispatch(clearError());
  }, [isAuthenticated, dispatch]);

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }


  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;