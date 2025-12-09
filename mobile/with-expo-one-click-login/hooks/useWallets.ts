import { useState, useCallback } from 'react';
import { para } from '@/lib/para';
import type { Wallet } from '@/types';

interface UseWalletsResult {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  loadWallets: () => Promise<void>;
  clearWallets: () => void;
}

export function useWallets(): UseWalletsResult {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const evmWallets = await para.getWalletsByType('EVM');

      const walletList: Wallet[] = Object.values(evmWallets || {}).map((w) => ({
        id: w.id,
        address: w.address || '',
        type: 'EVM',
      }));

      setWallets(walletList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallets';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearWallets = useCallback(() => {
    setWallets([]);
    setError(null);
  }, []);

  return {
    wallets,
    isLoading,
    error,
    loadWallets,
    clearWallets,
  };
}
