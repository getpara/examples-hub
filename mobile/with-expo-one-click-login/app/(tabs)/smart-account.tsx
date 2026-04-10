import { View, Text, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useState, useRef, useEffect } from 'react';
import type { Hash } from 'viem';

import { Card, Button } from '@/components/ui';
import { useWallet } from '@getpara/react-native-wallet';
import { useAlchemySmartAccount } from '@getpara/react-native-wallet/aa/alchemy';
import { truncateAddress } from '@/lib/auth';
import { ALCHEMY_API_KEY, GAS_POLICY_ID, CHAIN, BURN_ADDRESS } from '@/lib/alchemy';

export default function SmartAccountScreen() {
  const { data: wallet } = useWallet();
  const eoaAddress = wallet?.address ?? '';

  const {
    smartAccount,
    isLoading: isSmartAccountLoading,
    error: smartAccountError,
  } = useAlchemySmartAccount({
    apiKey: ALCHEMY_API_KEY,
    chain: CHAIN,
    gasPolicyId: GAS_POLICY_ID,
    mode: '4337',
  });

  const {
    mutateAsync: sendGaslessTx,
    isPending: isSending,
    data: txHash,
    error: txError,
    reset: resetTx,
  } = useMutation({
    mutationFn: async (): Promise<Hash> => {
      if (!smartAccount) throw new Error('Smart account not ready');
      const receipt = await smartAccount.sendTransaction({ to: BURN_ADDRESS });
      return receipt.transactionHash;
    },
  });

  const [copied, setCopied] = useState<'eoa' | 'smart' | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  const handleCopy = async (address: string, type: 'eoa' | 'smart') => {
    await Clipboard.setStringAsync(address);
    setCopied(type);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(null), 2000);
  };

  const handleViewOnEtherscan = () => {
    if (txHash && CHAIN.blockExplorers?.default.url) {
      Linking.openURL(`${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <Card variant="elevated" className="mb-4 p-6">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Connected Wallets</Text>

          <View className="mb-4 rounded-xl bg-gray-50 p-4">
            <Text className="mb-1 text-xs font-medium text-gray-500">EOA (Para Wallet)</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-sm text-gray-900">
                {truncateAddress(eoaAddress, 8)}
              </Text>
              <Ionicons
                name={copied === 'eoa' ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copied === 'eoa' ? '#10B981' : '#6B7280'}
                onPress={() => handleCopy(eoaAddress, 'eoa')}
              />
            </View>
          </View>

          <View className="rounded-xl bg-gray-50 p-4">
            <Text className="mb-1 text-xs font-medium text-gray-500">
              Smart Account (Alchemy Modular Account)
            </Text>
            {isSmartAccountLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#6B7280" />
                <Text className="text-sm text-gray-400">Initializing smart account...</Text>
              </View>
            ) : smartAccountError ? (
              <Text className="text-sm text-red-600">{smartAccountError.message}</Text>
            ) : smartAccount?.smartAccountAddress ? (
              <View className="flex-row items-center justify-between">
                <Text className="font-mono text-sm text-gray-900">
                  {truncateAddress(smartAccount.smartAccountAddress, 8)}
                </Text>
                <Ionicons
                  name={copied === 'smart' ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={copied === 'smart' ? '#10B981' : '#6B7280'}
                  onPress={() => handleCopy(smartAccount.smartAccountAddress, 'smart')}
                />
              </View>
            ) : (
              <Text className="text-sm text-gray-400">Not available</Text>
            )}
          </View>
        </Card>

        <Card variant="elevated" className="mb-4 p-6">
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            Send Sponsored Transaction
          </Text>
          <Text className="mb-4 text-sm text-gray-500">
            Sends a zero-value transaction to demonstrate EIP-4337 gas sponsorship via Alchemy&apos;s
            paymaster.
          </Text>

          <Button
            title={isSending ? 'Sending...' : 'Send Gasless Transaction'}
            loading={isSending}
            onPress={() => {
              resetTx();
              sendGaslessTx().catch(() => {});
            }}
            disabled={!smartAccount || isSending}
            icon={<Ionicons name="flash-outline" size={20} color="#fff" />}
          />

          {txError && !isSending && (
            <View className="mt-4 rounded-xl bg-red-50 p-4">
              <Text className="text-sm text-red-600">
                {txError.message || 'Transaction failed. Please try again.'}
              </Text>
            </View>
          )}

          {txHash && !isSending && (
            <View className="mt-4 rounded-xl bg-green-50 p-4">
              <Text className="mb-2 text-sm font-medium text-green-800">
                Transaction sent successfully!
              </Text>
              <Text className="mb-3 font-mono text-xs text-green-700" selectable>
                {txHash}
              </Text>
              <Button
                title="View on Etherscan"
                variant="outline"
                size="sm"
                onPress={handleViewOnEtherscan}
                icon={<Ionicons name="open-outline" size={16} color="#374151" />}
              />
            </View>
          )}
        </Card>

        <View className="rounded-xl bg-indigo-50 p-4">
          <Text className="mb-1 text-sm font-medium text-indigo-800">
            What is Account Abstraction?
          </Text>
          <Text className="text-xs leading-5 text-indigo-700">
            Account Abstraction (EIP-4337) lets you use smart contract wallets that support gas
            sponsorship, batched transactions, and custom validation. Your Para wallet acts as the
            signer, while the smart account handles on-chain execution.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
