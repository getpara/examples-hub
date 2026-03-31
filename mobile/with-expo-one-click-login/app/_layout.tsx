import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider } from '@getpara/react-native-wallet';
import Toast from 'react-native-toast-message';
import { para } from '@/lib/para';
import type { CoreCallbacks } from '@getpara/react-native-wallet';

const queryClient = new QueryClient();

const callbacks: CoreCallbacks = {
  onLogin: () => {
    Toast.show({ type: 'success', text1: 'Logged In', text2: 'User successfully logged in' });
  },
  onLogout: () => {
    Toast.show({ type: 'info', text1: 'Logged Out', text2: 'User session ended' });
  },
  onAccountSetup: () => {
    Toast.show({ type: 'success', text1: 'Account Setup', text2: 'Wallet setup completed' });
  },
  onAccountCreation: () => {
    Toast.show({ type: 'success', text1: 'Account Created', text2: 'New account registered' });
  },
  onSignMessage: (event) => {
    const hasError = event?.detail?.error;
    Toast.show({
      type: hasError ? 'error' : 'success',
      text1: 'Message Signed',
      text2: hasError ? `Error: ${hasError.message}` : 'Message signed successfully',
    });
  },
  onSignTransaction: (event) => {
    const hasError = event?.detail?.error;
    Toast.show({
      type: hasError ? 'error' : 'success',
      text1: 'Transaction Signed',
      text2: hasError ? `Error: ${hasError.message}` : 'Transaction signed successfully',
    });
  },
  onWalletCreated: () => {
    Toast.show({ type: 'success', text1: 'Wallet Created', text2: 'New wallet created' });
  },
  onWalletsChange: () => {
    Toast.show({ type: 'info', text1: 'Wallets Updated', text2: 'Wallet list changed' });
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ParaProvider paraClientConfig={para} config={{ appName: 'Para One Click Login' }} callbacks={callbacks}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
          <Toast />
        </ParaProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
