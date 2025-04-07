import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authenticateUser } from './utils/userUtils';
import { UserProvider } from './context/UserContext';

import { useColorScheme } from '@/hooks/useColorScheme';
import CustomSplashScreen from './components/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize authentication when app loads
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Authenticate the user and get the user ID
        const userId = await authenticateUser();
        // Store the user ID in AsyncStorage for later use
        await AsyncStorage.setItem('userId', userId);
        console.log('User authenticated successfully with ID:', userId);
        setAuthInitialized(true);
      } catch (error) {
        console.error('Error initializing authentication:', error);
        // Continue even if authentication fails, as we can use local UUID fallback
        setAuthInitialized(true);
      }
    };

    if (loaded) {
      SplashScreen.hideAsync();
      initAuth();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (showSplash) {
    return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  if (!authInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing app...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meeting" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
