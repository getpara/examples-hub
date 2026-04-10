/**
 * Thin wrapper around useParaViemClient from react-core.
 * Adds balance fetching and convenience methods for the example app.
 */
import { useCallback, useState } from 'react';
import { createPublicClient, http, formatEther, parseEther, type Hex, type PublicClient } from 'viem';
import { sepolia } from 'viem/chains';
import { useParaViemClient } from '@getpara/react-core/evm/viem';

const publicClient: PublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export function useViemClient() {
  const { viemClient, isLoading: isClientLoading } = useParaViemClient({
    walletClientConfig: {
      chain: sepolia,
      transport: http(),
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = !!viemClient;
  const account = viemClient?.account ?? null;

  const getBalance = useCallback(async (): Promise<string | null> => {
    if (!account) return null;

    try {
      setIsLoading(true);
      setError(null);
      const balance = await publicClient.getBalance({ address: account.address });
      return formatEther(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const sendTransaction = useCallback(
    async (to: Hex, amount: string): Promise<Hex | null> => {
      if (!viemClient) return null;

      try {
        setIsLoading(true);
        setError(null);
        return await viemClient.sendTransaction({
          to,
          value: parseEther(amount),
          chain: sepolia,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send transaction');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [viemClient],
  );

  return {
    account,
    walletClient: viemClient,
    publicClient,
    isReady,
    getBalance,
    sendTransaction,
    isLoading: isClientLoading || isLoading,
    error,
  };
}
