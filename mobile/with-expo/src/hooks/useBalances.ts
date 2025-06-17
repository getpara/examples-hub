import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { WalletType } from '@getpara/react-native-wallet';
import { useWallets } from './useWallets';
import { useSigners } from './useSigners';
import {
  fetchEvmWalletBalance,
  fetchSolanaWalletBalance,
} from '@/utils/api/balancesApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { createBalanceQueryOptions } from '@/utils/queryUtils';
import { SUPPORTED_WALLET_TYPES } from '@/types';

interface WalletBalance {
  amount: string;
  symbol: string;
  decimals: number;
}

type BalancesByWalletId = Record<string, WalletBalance>;

type BalancesBySupportedType = {
  [K in (typeof SUPPORTED_WALLET_TYPES)[number]]: BalancesByWalletId;
};

const EMPTY_BALANCES: BalancesBySupportedType = {
  [WalletType.EVM]: {},
  [WalletType.SOLANA]: {},
};

export const useBalances = () => {
  const { wallets, hasEvmWallets, hasSolanaWallets } = useWallets();
  const {
    ethereumProvider,
    solanaConnection,
    isSignersLoading,
    areSignersInitialized,
  } = useSigners();

  // Create stable query keys to avoid cache misses
  const evmWalletIds = useMemo(
    () => createStableWalletKey(wallets[WalletType.EVM].map((w) => w.id)),
    [wallets]
  );
  const solanaWalletIds = useMemo(
    () => createStableWalletKey(wallets[WalletType.SOLANA].map((w) => w.id)),
    [wallets]
  );

  const queriesConfig = useMemo(() => {
    return SUPPORTED_WALLET_TYPES.map((walletType) => {
      const hasWallets =
        walletType === WalletType.EVM ? hasEvmWallets : hasSolanaWallets;
      const walletsForType = wallets[walletType];
      const walletIds =
        walletType === WalletType.EVM ? evmWalletIds : solanaWalletIds;
      const provider = walletType === WalletType.EVM ? ethereumProvider : null;
      const connection =
        walletType === WalletType.SOLANA ? solanaConnection : null;

      // Check if we have the necessary provider/connection
      const hasProvider =
        walletType === WalletType.EVM ? !!provider : !!connection;

      return createBalanceQueryOptions({
        queryKey: QUERY_KEYS.BALANCES_BY_WALLETS(walletIds),
        queryFn: async (): Promise<BalancesByWalletId> => {
          if (walletsForType.length === 0) {
            return {};
          }

          const result: BalancesByWalletId = {};

          // Fetch balances for each wallet
          const balancePromises = walletsForType.map(async (wallet) => {
            try {
              if (walletType === WalletType.EVM && provider) {
                const balances = await fetchEvmWalletBalance(wallet, provider);
                return { walletId: wallet.id, balances };
              } else if (walletType === WalletType.SOLANA && connection) {
                const balances = await fetchSolanaWalletBalance(
                  wallet,
                  connection
                );
                return { walletId: wallet.id, balances };
              }
              return null;
            } catch (error) {
              console.error(
                `Error fetching balance for wallet ${wallet.id}:`,
                error
              );
              return null;
            }
          });

          const balanceResults = await Promise.all(balancePromises);

          // Process results
          balanceResults.forEach((balanceResult) => {
            if (
              balanceResult &&
              balanceResult.balances &&
              balanceResult.balances.length > 0
            ) {
              // For now, we only handle native tokens (first balance)
              const balance = balanceResult.balances[0];
              result[balanceResult.walletId] = {
                amount: balance.balance,
                symbol: balance.symbol,
                decimals: balance.decimals,
              };
            }
          });

          return result;
        },
        enabled:
          areSignersInitialized &&
          hasWallets &&
          hasProvider &&
          !isSignersLoading,
        retry: false, // Don't retry auth-dependent queries
      });
    });
  }, [
    wallets,
    evmWalletIds,
    solanaWalletIds,
    hasEvmWallets,
    hasSolanaWallets,
    ethereumProvider,
    solanaConnection,
    areSignersInitialized,
    isSignersLoading,
  ]);

  const results = useQueries({ queries: queriesConfig });

  const balances: BalancesBySupportedType = useMemo(() => {
    const newBalances = { ...EMPTY_BALANCES };

    results.forEach((result, index) => {
      const walletType = SUPPORTED_WALLET_TYPES[index];
      if (result.data) {
        newBalances[walletType] = result.data;
      }
    });

    return newBalances;
  }, [results]);

  const isBalancesLoading = results.some((result) => result.isLoading);
  const isBalancesError = results.some((result) => result.isError);
  const balancesError = results.find((result) => result.error)?.error;

  // Calculate total balances
  const totalEthBalance = useMemo(() => {
    return calculateTotalBalance(balances[WalletType.EVM]);
  }, [balances]);

  const totalSolBalance = useMemo(() => {
    return calculateTotalBalance(balances[WalletType.SOLANA]);
  }, [balances]);

  // Refetch all balances
  const refetchBalances = async () => {
    await Promise.all(results.map((result) => result.refetch()));
  };

  return {
    balances,
    totalEthBalance,
    totalSolBalance,
    areBalancesLoaded: !isBalancesLoading && !isSignersLoading,
    isBalancesLoading,
    isBalancesError,
    balancesError,
    refetchBalances,
  };
};

// Helper function to create a stable wallet key
function createStableWalletKey(walletIds: string[]): string {
  return walletIds.sort().join(',');
}

// Helper function to calculate total balance
function calculateTotalBalance(balancesByWallet: BalancesByWalletId): string {
  let total = BigInt(0);

  for (const balance of Object.values(balancesByWallet)) {
    try {
      total += BigInt(balance.amount);
    } catch (error) {
      console.error('Error adding balance:', error);
    }
  }

  return total.toString();
}
