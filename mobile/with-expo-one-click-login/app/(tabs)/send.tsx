import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import type { Hex } from 'viem';

import { Button } from '@/components/ui';
import { useViemClient } from '@/hooks/useViemClient';

export default function SendScreen() {
  const router = useRouter();
  const { isReady, getBalance, sendTransaction, isLoading, error } = useViemClient();

  const [balance, setBalance] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const fetchBalance = useCallback(async () => {
    if (isReady) {
      const bal = await getBalance();
      setBalance(bal);
    }
  }, [isReady, getBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSend = async () => {
    if (!recipient) {
      Alert.alert('Error', 'Please enter a recipient address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ETH to\n${recipient.slice(0, 16)}...?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const hash = await sendTransaction(recipient as Hex, amount);
            if (hash) {
              Alert.alert(
                'Success',
                `Transaction sent!\n\nHash: ${hash.slice(0, 20)}...`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } else if (error) {
              Alert.alert('Error', error);
            }
          },
        },
      ]
    );
  };

  const displayBalance = balance ? `${parseFloat(balance).toFixed(6)} ETH` : 'Loading...';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1 p-6">
          {/* Balance Display */}
          <View className="mb-6 rounded-2xl bg-white p-4">
            <Text className="text-sm text-gray-500">Available Balance</Text>
            <Text className="text-2xl font-bold text-gray-900">{displayBalance}</Text>
          </View>

          {/* Form */}
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium text-gray-700">Recipient Address</Text>
            <TextInput
              className="mb-4 rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm"
              placeholder="0x..."
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text className="mb-2 text-sm font-medium text-gray-700">Amount (ETH)</Text>
            <TextInput
              className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-sm"
              placeholder="0.001"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Send Button */}
          <Button
            title={isLoading ? 'Sending...' : 'Send ETH'}
            onPress={handleSend}
            disabled={isLoading || !isReady}
            icon={<Ionicons name="send-outline" size={20} color="#fff" />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
