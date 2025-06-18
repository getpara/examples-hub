import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WalletType } from '@getpara/react-native-wallet';
import { SupportedWalletType } from '@/types';

import {
  StatusIndicator,
  TransactionStatus,
} from '@/components/transaction/StatusIndicator';
import { SuccessDisplay } from '@/components/transaction/SuccessDisplay';
import {
  ErrorDisplay,
  TransactionError,
} from '@/components/transaction/ErrorDisplay';
import { ExplorerLink } from '@/components/transaction/ExplorerLink';
import { useTransactions } from '@/hooks/useTransactions';
import { getNetworkName } from '@/utils';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

export default function TransactionStatusScreen() {
  const { networkType, to, amount, usdValue } = useLocalSearchParams<{
    networkType: string;
    to: string;
    amount: string;
    usdValue?: string;
  }>();
  const net = (networkType as WalletType) || WalletType.EVM;
  const router = useRouter();
  const { sendEvmTransaction, sendSolTransaction } = useTransactions();

  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [elapsed, setElapsed] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<TransactionError | null>(null);
  const [hasSentTransaction, setHasSentTransaction] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (hasSentTransaction) return;

    const send = async () => {
      setHasSentTransaction(true);
      try {
        const hash =
          net === WalletType.EVM
            ? await sendEvmTransaction({ to, amount })
            : await sendSolTransaction({ to, amount });
        setTxHash(hash);
        setStatus('confirmed');
      } catch (err) {
        console.error('Transaction error', err);
        setError({
          category: 'unknown',
          message: err instanceof Error ? err.message : String(err),
        });
        setStatus('failed');
      }
    };
    send();
  }, [
    hasSentTransaction,
    sendEvmTransaction,
    sendSolTransaction,
    net,
    to,
    amount,
  ]);

  const explorer = txHash ? (
    <ExplorerLink
      txHash={txHash}
      networkType={net as SupportedWalletType}
      variant="button"
      className="mt-4"
    />
  ) : null;

  if (status === 'pending') {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <StatusIndicator
          status="pending"
          networkType={net}
          elapsedTime={elapsed}
        />
      </View>
    );
  }

  if (status === 'failed' && error) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <ErrorDisplay
          error={error}
          networkType={net as SupportedWalletType}
          onRetry={() =>
            router.replace({
              pathname: '/home/transaction/status',
              params: { networkType: net, to, amount, usdValue },
            })
          }
          onViewExplorer={txHash ? () => {} : undefined}
          txHash={txHash || undefined}
        />
      </View>
    );
  }

  if (status === 'confirmed' && txHash) {
    return (
      <View className="flex-1 bg-background px-6 pt-6">
        <SuccessDisplay
          txHash={txHash}
          amount={amount}
          tokenTicker={net === WalletType.EVM ? 'ETH' : 'SOL'}
          tokenName={net === WalletType.EVM ? 'Ethereum' : 'Solana'}
          recipientAddress={to}
          amountUsd={usdValue ? parseFloat(usdValue) : null}
          networkType={net as SupportedWalletType}
          networkName={getNetworkName(net as SupportedWalletType)}
          submittedAt={Date.now() - elapsed * 1000}
          confirmedAt={Date.now()}
          confirmationDuration={elapsed}
          onReturn={() => router.navigate('/home')}
          onViewExplorer={() => {}}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text>Processing...</Text>
      {explorer}
      <Button className="mt-4" onPress={() => router.navigate('/home')}>
        <Text className="text-primary-foreground">Return</Text>
      </Button>
    </View>
  );
}
