import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';

import { Card, Button } from '@/components/ui';
import { truncateAddress } from '@/lib/auth';
import { useAccount, useClient, useExportPrivateKey, useWallet } from '@getpara/react-native-wallet';

type WalletType = 'EVM' | 'COSMOS';

export default function AccountScreen() {
  const account = useAccount();
  const client = useClient();
  const { data: wallet } = useWallet();
  const { exportPrivateKeyAsync, isPending: isExporting } = useExportPrivateKey();

  const authMethods = account.authMethods ? Array.from(account.authMethods) : [];

  // Build the list of supported address types for this wallet (mirrors portal page logic)
  const addressViews = useMemo<{ type: WalletType; address: string }[]>(() => {
    if (!client || !wallet?.id) return [];
    const supported = (client.supportedWalletTypes ?? [])
      .map(({ type }) => type)
      .filter((t): t is WalletType => t === 'EVM' || t === 'COSMOS');
    const types: WalletType[] = supported.length > 0 ? supported : ['EVM'];
    return types.map((type) => ({
      type,
      address: client.getDisplayAddress(wallet.id, { addressType: type }) ?? '',
    }));
  }, [client, wallet?.id]);

  const [selectedType, setSelectedType] = useState<WalletType>('EVM');
  const activeView = addressViews.find((v) => v.type === selectedType) ?? addressViews[0];

  const handleExport = () => {
    Alert.alert(
      'Export Private Key',
      'Your private key grants full access to your wallet. Never share it with anyone.\n\nAre you sure you want to export it?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          style: 'destructive',
          onPress: async () => {
            if (!wallet?.id) return;
            try {
              const result = await exportPrivateKeyAsync({ walletId: wallet.id });
              if (result?.url) {
                await WebBrowser.openBrowserAsync(result.url);
              }
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to export key');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Your Account</Text>
          <Text className="mt-1 text-gray-500">Identity &amp; Security</Text>
        </View>

        {/* ── Account Status ─────────────────────────────────────── */}
        <Card variant="elevated" className="mb-4 p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Account Status
            </Text>
            <View
              className={`rounded-full px-3 py-1 ${account.isConnected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <Text
                className={`text-xs font-medium ${account.isConnected ? 'text-emerald-700' : 'text-gray-500'}`}>
                {account.isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          <View className="rounded-xl bg-gray-50 p-4">
            <Text className="mb-1 text-xs text-gray-500">User ID</Text>
            <Text className="font-mono text-sm text-gray-900">
              {account.userId ? truncateAddress(account.userId, 10) : '—'}
            </Text>
          </View>
        </Card>

        {/* ── Auth Methods ───────────────────────────────────────── */}
        {authMethods.length > 0 && (
          <Card variant="outline" className="mb-4 p-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Auth Methods
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {authMethods.map((method) => (
                <View key={String(method)} className="rounded-full bg-indigo-100 px-3 py-1">
                  <Text className="text-xs font-medium capitalize text-indigo-700">
                    {String(method).toLowerCase().replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* ── Export Private Key ─────────────────────────────────── */}
        <Card variant="outline" className="mb-4 p-6">
          <View className="mb-3 flex-row items-center gap-2">
            <Ionicons name="key-outline" size={16} color="#6B7280" />
            <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Security
            </Text>
          </View>

          {/* Wallet address display — matches portal page */}
          {activeView && (
            <View className="mb-4">
              <Text className="mb-2 text-xs text-gray-500">Wallet</Text>

              {addressViews.length > 1 ? (
                // Dropdown-style picker when both EVM + Cosmos are available
                <View className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {addressViews.map((view, i) => (
                    <TouchableOpacity
                      key={view.type}
                      onPress={() => setSelectedType(view.type)}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        i < addressViews.length - 1 ? 'border-b border-gray-100' : ''
                      } ${selectedType === view.type ? 'bg-brand-50' : ''}`}>
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`rounded-full px-2 py-0.5 ${
                            view.type === 'EVM' ? 'bg-indigo-100' : 'bg-purple-100'
                          }`}>
                          <Text
                            className={`text-xs font-semibold ${
                              view.type === 'EVM' ? 'text-indigo-700' : 'text-purple-700'
                            }`}>
                            {view.type}
                          </Text>
                        </View>
                        <Text className="font-mono text-sm text-gray-900">
                          {truncateAddress(view.address, 8)}
                        </Text>
                      </View>
                      {selectedType === view.type && (
                        <Ionicons name="checkmark" size={16} color="#ff4e00" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                // Single address — show inline with type badge
                <View className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      activeView.type === 'EVM' ? 'bg-indigo-100' : 'bg-purple-100'
                    }`}>
                    <Text
                      className={`text-xs font-semibold ${
                        activeView.type === 'EVM' ? 'text-indigo-700' : 'text-purple-700'
                      }`}>
                      {activeView.type}
                    </Text>
                  </View>
                  <Text className="font-mono text-sm text-gray-900">
                    {truncateAddress(activeView.address, 8)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <Text className="mb-4 text-sm leading-5 text-gray-500">
            Export your wallet's private key for use in other applications. Keep it safe —
            anyone with your key controls your wallet.
          </Text>
          <Button
            title={isExporting ? 'Exporting…' : 'Export Private Key'}
            testID="export-key-button"
            variant="outline"
            onPress={handleExport}
            disabled={isExporting || !wallet?.id}
            icon={<Ionicons name="key-outline" size={18} color="#374151" />}
          />
        </Card>

        <View className="mt-4 items-center">
          <Text className="text-sm text-gray-400">Powered by Para</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
