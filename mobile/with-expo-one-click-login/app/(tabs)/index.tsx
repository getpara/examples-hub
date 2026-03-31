import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';

import { WalletCard, Button } from '@/components/ui';
import { useWallet, useLogout, useIsFullyLoggedIn, useSignMessage } from '@getpara/react-native-wallet';
import { useViemClient } from '@/hooks/useViemClient';

export default function HomeScreen() {
  const router = useRouter();
  const { data: wallet } = useWallet();
  const { logoutAsync: logout } = useLogout();
  const { refetch: refreshAuth } = useIsFullyLoggedIn();
  const { isReady, getBalance, isLoading: isViemLoading } = useViemClient();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (isReady) {
      const bal = await getBalance();
      setBalance(bal);
    }
  }, [isReady, getBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAuth();
    await fetchBalance();
    setRefreshing(false);
  }, [refreshAuth, fetchBalance]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout({});
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const handleSend = () => {
    router.push('/(tabs)/send');
  };

  const handleAccount = () => {
    router.push('/(tabs)/account');
  };

  const handleSign = async () => {
    setSignature(null);
    if (!wallet?.id) return;

    try {
      // useSignMessage wraps para.signMessage — pass walletId + base64-encoded message
      const messageBase64 = btoa('Hello from Para!');
      const res = await signMessageAsync({ walletId: wallet.id, messageBase64 });
      if (res && 'signature' in res) {
        setSignature(`0x${res.signature}`);
      }
    } catch {
      // signing cancelled or failed — nothing to surface here
    }
  };

  const displayBalance = balance ? `${parseFloat(balance).toFixed(6)} ETH` : 'Loading...';

  return (
    <SafeAreaView testID="walletsView" className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Your Wallet</Text>
          <Text className="mt-1 text-gray-500">Manage your assets</Text>
        </View>

        {wallet ? (
          <WalletCard
            address={wallet.address ?? ''}
            balance={displayBalance}
            network="Sepolia"
            onSend={handleSend}
            onSign={handleSign}
            signing={isSigning || isViemLoading}
          />
        ) : (
          <View className="items-center rounded-2xl bg-white p-6">
            <Text className="text-center text-gray-500">No wallet found. Pull to refresh.</Text>
          </View>
        )}

        {signature && (
          <View className="mt-4 rounded-xl bg-white p-4">
            <Text className="mb-1 text-xs font-semibold text-gray-500">SIGNATURE</Text>
            <Text className="font-mono text-xs text-gray-600" selectable>
              {signature.slice(0, 20)}...{signature.slice(-20)}
            </Text>
          </View>
        )}

        <View className="mt-6 gap-3">
          <Button
            title="Account &amp; Security"
            testID="account-button"
            variant="secondary"
            onPress={handleAccount}
            icon={<Ionicons name="person-outline" size={20} color="#374151" />}
          />
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
          />
        </View>

        <View className="mt-8 items-center">
          <Text className="text-sm text-gray-400">Powered by Para</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
