// src/components/history/TransactionItem.tsx
import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { WalletType } from '@getpara/react-native-wallet';
import { formatUsdValue, formatAddress } from '@/utils/formattingUtils';
import {} from '@/utils/transactionUtils';
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  CheckCircle,
  Clock,
  XCircle,
} from '@/components/icons';

export type TransactionType = 'send' | 'receive' | 'swap' | 'contract';
export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface BaseTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  amount: string;
  tokenTicker: string;
  tokenName: string;
  amountUsd: number | null;
  networkType: WalletType;
  counterpartyAddress: string; // sender or recipient
  counterpartyName?: string;
  hash: string;
}

export interface EvmTransactionData extends BaseTransaction {
  networkType: WalletType.EVM;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  nonce?: number;
}

export interface SolanaTransactionData extends BaseTransaction {
  networkType: WalletType.SOLANA;
  slot?: number;
  fee?: string;
  signature?: string;
}

export type TransactionData = EvmTransactionData | SolanaTransactionData;

export interface TransactionItemProps {
  transaction: TransactionData;
  onPress: (transaction: TransactionData) => void;
}

export function TransactionListItem({
  transaction,
  onPress,
}: TransactionItemProps) {
  const {
    type,
    status,
    timestamp,
    amount,
    tokenTicker,
    amountUsd,
    counterpartyAddress,
    counterpartyName: _counterpartyName,
  } = transaction;

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Get transaction icon
  const getTransactionIcon = () => {
    if (type === 'send') {
      return (
        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
          <ArrowUpFromLine size={20} className="text-red-600" />
        </View>
      );
    } else if (type === 'receive') {
      return (
        <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
          <ArrowDownToLine size={20} className="text-green-600" />
        </View>
      );
    } else {
      return (
        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
          <ArrowDownToLine size={20} className="text-blue-600" />
        </View>
      );
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'confirmed':
        return (
          <View className="flex-row items-center">
            <CheckCircle size={14} className="text-green-500 mr-1" />
            <Text className="text-xs text-green-500">Confirmed</Text>
          </View>
        );
      case 'pending':
        return (
          <View className="flex-row items-center">
            <Clock size={14} className="text-yellow-500 mr-1" />
            <Text className="text-xs text-yellow-500">Pending</Text>
          </View>
        );
      case 'failed':
        return (
          <View className="flex-row items-center">
            <XCircle size={14} className="text-destructive mr-1" />
            <Text className="text-xs text-destructive">Failed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Get network-specific details
  const getNetworkDetails = () => {
    if (transaction.networkType === WalletType.EVM) {
      const evmTx = transaction as EvmTransactionData;
      return evmTx.blockNumber ? `Block: ${evmTx.blockNumber}` : '';
    } else if (transaction.networkType === WalletType.SOLANA) {
      const solTx = transaction as SolanaTransactionData;
      return solTx.slot ? `Slot: ${solTx.slot}` : '';
    }
    return '';
  };

  const networkDetail = getNetworkDetails();

  return (
    <Pressable
      onPress={() => onPress(transaction)}
      className="flex-row items-center p-4 border-b border-border active:bg-muted"
      accessibilityRole="button"
      accessibilityLabel={`${type} transaction of ${amount} ${tokenTicker}`}
    >
      {getTransactionIcon()}

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-foreground capitalize">
            {type}
          </Text>
          <Text
            className={`text-base font-medium ${type === 'send' ? 'text-red-600' : 'text-green-600'}`}
          >
            {type === 'send' ? '-' : '+'}
            {amount} {tokenTicker}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <View>
            <Text className="text-xs text-muted-foreground">
              {formatDate(timestamp)}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-muted-foreground mr-2">
                {type === 'send' ? 'To:' : 'From:'}{' '}
                {formatAddress(counterpartyAddress, transaction.networkType)}
              </Text>
              {getStatusIndicator()}
            </View>
          </View>

          {amountUsd !== null && (
            <Text className="text-xs text-muted-foreground">
              {formatUsdValue(amountUsd)}
            </Text>
          )}
        </View>

        {networkDetail ? (
          <Text className="text-xs text-muted-foreground mt-1">
            {networkDetail}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
