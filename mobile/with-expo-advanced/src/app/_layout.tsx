import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useEffect } from 'react';
import { usePara } from '@/hooks/usePara';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <RootStack />
        <PortalHost />
        <Toaster
          position="top-center"
          duration={1500}
          swipeToDismissDirection="up"
          closeButton={true}
        />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

function RootStack() {
  const {
    isClientLoading,
    isClientReady,
    isAuthenticated,
    isAuthStatusLoading,
  } = usePara();

  useEffect(() => {
    if (!isClientLoading && isClientReady && !isAuthStatusLoading) {
      SplashScreen.hideAsync();
    }
  }, [isClientLoading, isClientReady, isAuthStatusLoading]);

  if (isClientLoading || !isClientReady || isAuthStatusLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#ffffff' },
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          presentation: 'card',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen
            name="auth"
            options={{
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen
            name="home"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack.Protected>
      </Stack>
    </SafeAreaView>
  );
}
