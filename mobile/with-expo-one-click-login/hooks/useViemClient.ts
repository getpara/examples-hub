import { useMemo, useCallback, useState } from 'react';
import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
  parseEther,
  hashMessage,
  type WalletClient,
  type PublicClient,
  type LocalAccount,
  type Hex,
} from 'viem';
import { sepolia } from 'viem/chains';
import { createParaAccount } from '@getpara/viem-v2-integration';
import { openBrowserAsync } from 'expo-web-browser';
import type { SuccessfulSignatureRes } from '@getpara/react-native-wallet';

import { para } from '@/lib/para';
import { useWallet, useIsFullyLoggedIn } from '@getpara/react-native-wallet';

function hexToBase64(hex: string): string {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  return btoa(String.fromCharCode(...bytes));
}

interface UseViemClientResult {
  account: LocalAccount | null;
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  isReady: boolean;
  getBalance: () => Promise<string | null>;
  sendTransaction: (to: Hex, amount: string) => Promise<Hex | null>;
  signMessage: (message: string) => Promise<Hex | null>;
  isLoading: boolean;
  error: string | null;
}

export function useViemClient(): UseViemClientResult {
  const { data: isAuthenticated } = useIsFullyLoggedIn();
  const { data: paraWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { account, walletClient, publicClient } = useMemo(() => {
    if (!isAuthenticated || !paraWallet?.address) {
      return { account: null, walletClient: null, publicClient: null };
    }

    // Verify the wallet exists in the current session before creating the account.
    // After logout + re-login, paraWallet may briefly hold a stale address.
    const currentWallets = para.getWallets() ?? {};
    const walletAddress = paraWallet.address as Hex;
    const hasWallet = Object.values(currentWallets).some(
      (w) => w.address?.toLowerCase() === walletAddress.toLowerCase(),
    );
    if (!hasWallet) {
      return { account: null, walletClient: null, publicClient: null };
    }

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
  }, [isAuthenticated, paraWallet]);

  const getBalance = useCallback(async (): Promise<string | null> => {
    if (!publicClient || !account) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const balance = await publicClient.getBalance({ address: account.address });
      return formatEther(balance);
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

        const hash = await walletClient.sendTransaction({
          to,
          value: parseEther(amount),
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
    [walletClient, account],
  );

  const walletId = useMemo(() => Object.keys(para.getWallets() ?? {})[0], [paraWallet]);

  // Uses para.signMessage directly (instead of viem's walletClient.signMessage) so we can
  // pass onTransactionReviewUrl for transaction popup support on React Native.
  const signMessage = useCallback(
    async (message: string): Promise<Hex | null> => {
      if (!account || !walletId) {
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const messageBase64 = hexToBase64(hashMessage(message));

        const res = await para.signMessage({
          walletId,
          messageBase64,
          onTransactionReviewUrl: (url) => {
            openBrowserAsync(url);
          },
        });

        const signature = (res as SuccessfulSignatureRes).signature;
        return `0x${signature}` as Hex;
      } catch (err) {
        const message_ = err instanceof Error ? err.message : 'Failed to sign message';
        setError(message_);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [account, walletId],
  );

  return {
    account,
    walletClient,
    publicClient,
    isReady: account !== null && walletClient !== null && publicClient !== null,
    getBalance,
    sendTransaction,
    signMessage,
    isLoading,
    error,
  };
}
