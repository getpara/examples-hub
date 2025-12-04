import { useMemo, useCallback, useState } from 'react';
import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
  parseEther,
  type WalletClient,
  type PublicClient,
  type LocalAccount,
  type Hex,
} from 'viem';
import { sepolia } from 'viem/chains';
import { createParaAccount } from '@getpara/viem-v2-integration';

import { para } from '@/lib/para';
import { usePara } from '@/providers/ParaProvider';

interface UseViemClientResult {
  account: LocalAccount | null;
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  isReady: boolean;
  getBalance: () => Promise<string | null>;
  sendTransaction: (to: Hex, amount: string) => Promise<Hex | null>;
  isLoading: boolean;
  error: string | null;
}

export function useViemClient(): UseViemClientResult {
  const { isAuthenticated, wallets } = usePara();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { account, walletClient, publicClient } = useMemo(() => {
    if (!isAuthenticated || wallets.length === 0) {
      return { account: null, walletClient: null, publicClient: null };
    }

    const walletAddress = wallets[0].address as Hex;
    const paraAccount = createParaAccount(para, walletAddress);

    const wallet = createWalletClient({
      account: paraAccount,
      chain: sepolia,
      transport: http(),
    });

    const public_ = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    return { account: paraAccount, walletClient: wallet, publicClient: public_ };
  }, [isAuthenticated, wallets]);

  const getBalance = useCallback(async (): Promise<string | null> => {
    if (!publicClient || !account) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const balance = await publicClient.getBalance({ address: account.address });
      const formatted = formatEther(balance);

      return formatted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get balance';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, account]);

  const sendTransaction = useCallback(
    async (to: Hex, amount: string): Promise<Hex | null> => {
      if (!walletClient || !account) {
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const value = parseEther(amount);

        const hash = await walletClient.sendTransaction({
          to,
          value,
          chain: sepolia,
        });

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send transaction';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, account]
  );

  return {
    account,
    walletClient,
    publicClient,
    isReady: account !== null && walletClient !== null && publicClient !== null,
    getBalance,
    sendTransaction,
    isLoading,
    error,
  };
}
