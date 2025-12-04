import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ParaProvider } from '@/providers/ParaProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ParaProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ParaProvider>
    </SafeAreaProvider>
  );
}
