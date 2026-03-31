import React, { useState } from 'react';
import { StatusBar, SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParaProvider, useIsFullyLoggedIn } from '@getpara/react-native-wallet';
import type { CoreCallbacks } from '@getpara/react-native-wallet';
import Toast from 'react-native-toast-message';
import { para } from './src/para';
import { AuthSection } from './src/components/AuthSection';
import { WalletSection } from './src/components/WalletSection';
import { AccountSection } from './src/components/AccountSection';

const queryClient = new QueryClient();

type Tab = 'wallet' | 'account';

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

function AppContent() {
  const { data: isAuthenticated } = useIsFullyLoggedIn();
  const [activeTab, setActiveTab] = useState<Tab>('wallet');

  if (!isAuthenticated) {
    return <AuthSection onSuccess={() => {}} />;
  }

  return (
    <View style={styles.authenticated}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallet' && styles.activeTab]}
          onPress={() => setActiveTab('wallet')}>
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>
            Wallet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}>
          <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'wallet' ? (
        <WalletSection onLogout={() => {}} />
      ) : (
        <AccountSection />
      )}
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider paraClientConfig={para} config={{ appName: 'Para SDK Demo' }} callbacks={callbacks}>
        <SafeAreaView style={styles.container}>
          <AppContent />
          <StatusBar barStyle="dark-content" />
          <Toast />
        </SafeAreaView>
      </ParaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authenticated: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#000000',
  },
});
