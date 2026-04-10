import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider } from '@getpara/react-native-wallet';
import { para } from '@/lib/para';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ParaProvider paraClientConfig={para} config={{ appName: 'Para Password' }}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
          </Stack>
        </ParaProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
