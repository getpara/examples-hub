import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Card } from './Card';
import { truncateAddress } from '@/lib/auth';

interface WalletCardProps {
  address: string;
  balance?: string;
  network?: string;
  onSend?: () => void;
}

export function WalletCard({
  address,
  balance = '$0.00',
  network = 'Ethereum',
  onSend,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="elevated" className="p-6">
      {/* Network Badge */}
      <View className="mb-4 flex-row items-center">
        <View className="rounded-full bg-indigo-100 px-3 py-1">
          <Text className="text-sm font-medium text-indigo-700">{network}</Text>
        </View>
      </View>

      {/* Balance */}
      <Text className="mb-1 text-4xl font-bold text-gray-900">{balance}</Text>
      <Text className="mb-6 text-sm text-gray-500">Total Balance</Text>

      {/* Address */}
      <View className="flex-row items-center justify-between rounded-xl bg-gray-50 p-4">
        <View className="flex-1">
          <Text className="mb-1 text-xs text-gray-500">Wallet Address</Text>
          <Text className="font-mono text-sm text-gray-900">{truncateAddress(address, 8)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleCopy}
          className="rounded-lg bg-gray-100 p-2 active:bg-gray-200">
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={20}
            color={copied ? '#10B981' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View className="mt-4">
        <TouchableOpacity
          onPress={onSend}
          className="items-center rounded-xl bg-brand-500 py-3 active:bg-brand-600">
          <Ionicons name="arrow-up" size={20} color="#fff" />
          <Text className="mt-1 text-sm font-medium text-white">Send</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
