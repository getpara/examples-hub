import { useQueries } from "@tanstack/react-query";
import { WalletType } from "@getpara/react-native-wallet";
import { useWallets } from "./useWallets";
import { useSigners } from "./useSigners";
import { SUPPORTED_WALLET_TYPES } from "@/types";
import {
  fetchEvmWalletBalance,
  fetchSolanaWalletBalance,
  calculateTotalEvmBalance,
  calculateTotalSolanaBalance,
} from "@/utils/balanceUtils";

export interface TokenBalance {
  amount: string;
  symbol: string;
  decimals: number;
}

export type BalancesByWalletId = Record<string, TokenBalance>;
export type BalancesBySupportedType = {
  [K in (typeof SUPPORTED_WALLET_TYPES)[number]]: BalancesByWalletId;
};

interface NetworkConfig {
  symbol: string;
  decimals: number;
  refetchInterval: number;
  staleTime: number;
}

const NETWORK_CONFIG: Record<(typeof SUPPORTED_WALLET_TYPES)[number], NetworkConfig> = {
  [WalletType.EVM]: {
    symbol: "ETH",
    decimals: 18,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  },
  [WalletType.SOLANA]: {
    symbol: "SOL",
    decimals: 9,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  },
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
    hasEthereumSigner,
    hasSolanaSigner,
  } = useSigners();

  const queriesConfig = SUPPORTED_WALLET_TYPES.map((walletType) => {
    const hasWallets = walletType === WalletType.EVM ? hasEvmWallets : hasSolanaWallets;
    const hasSigner = walletType === WalletType.EVM ? hasEthereumSigner : hasSolanaSigner;
    const provider = walletType === WalletType.EVM ? ethereumProvider : solanaConnection;

    return {
      queryKey: ["walletBalances", walletType, { walletIds: wallets[walletType].map((w) => w.id) }],
      queryFn: async (): Promise<BalancesByWalletId> => {
        const walletsForType = wallets[walletType];
        const config = NETWORK_CONFIG[walletType];
        const balances: BalancesByWalletId = {};

        if (walletType === WalletType.EVM && ethereumProvider) {
          const results = await Promise.all(
            walletsForType.map((wallet) =>
              fetchEvmWalletBalance(
                { ...wallet, address: wallet.address ?? null },
                ethereumProvider,
                config.symbol,
                config.decimals
              )
            )
          );

          for (const result of results) {
            if (result.balance) {
              balances[result.walletId] = result.balance;
            }
          }
        } else if (walletType === WalletType.SOLANA && solanaConnection) {
          const results = await Promise.all(
            walletsForType.map((wallet) =>
              fetchSolanaWalletBalance(
                { ...wallet, address: wallet.address ?? null },
                solanaConnection,
                config.symbol,
                config.decimals
              )
            )
          );

          for (const result of results) {
            if (result.balance) {
              balances[result.walletId] = result.balance;
            }
          }
        }

        return balances;
      },
      enabled: areSignersInitialized && hasWallets && hasSigner && !isSignersLoading && !!provider,
      refetchInterval: NETWORK_CONFIG[walletType].refetchInterval,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: NETWORK_CONFIG[walletType].staleTime,
      gcTime: 5 * 60 * 1000,
    };
  });

  const results = useQueries({ queries: queriesConfig });

  const balances: BalancesBySupportedType = { ...EMPTY_BALANCES };

  results.forEach((result, index) => {
    const walletType = SUPPORTED_WALLET_TYPES[index];
    if (result.data) {
      balances[walletType] = result.data;
    }
  });

  const loadingStates = Object.fromEntries(
    results.map((result, index) => [SUPPORTED_WALLET_TYPES[index], result.isLoading])
  ) as Record<(typeof SUPPORTED_WALLET_TYPES)[number], boolean>;

  const errorStates = Object.fromEntries(
    results.map((result, index) => [SUPPORTED_WALLET_TYPES[index], result.isError])
  ) as Record<(typeof SUPPORTED_WALLET_TYPES)[number], boolean>;

  const errors = Object.fromEntries(
    results.map((result, index) => [SUPPORTED_WALLET_TYPES[index], result.error])
  ) as Record<(typeof SUPPORTED_WALLET_TYPES)[number], Error | null>;

  const updatedAtTimestamps = results.map((result) => result.dataUpdatedAt).filter((timestamp) => timestamp > 0);

  const latestUpdatedAt = updatedAtTimestamps.length > 0 ? Math.max(...updatedAtTimestamps) : null;

  const refetchFunctions = Object.fromEntries(
    results.map((result, index) => [SUPPORTED_WALLET_TYPES[index], result.refetch])
  ) as Record<(typeof SUPPORTED_WALLET_TYPES)[number], () => Promise<unknown>>;

  const refetchAllBalances = async () => {
    return Promise.all(results.map((result) => result.refetch()));
  };

  const getWalletBalance = (
    walletId: string,
    walletType: (typeof SUPPORTED_WALLET_TYPES)[number]
  ): TokenBalance | null => {
    return balances[walletType][walletId] || null;
  };

  const totalEthBalance = calculateTotalEvmBalance(balances[WalletType.EVM]);
  const totalSolBalance = calculateTotalSolanaBalance(balances[WalletType.SOLANA]);

  const hasBalances = SUPPORTED_WALLET_TYPES.some((type) => Object.keys(balances[type]).length > 0);

  const isBalancesLoading = Object.values(loadingStates).some((loading) => loading);

  const isBalancesError = Object.values(errorStates).some((error) => error);

  return {
    balances,
    getWalletBalance,
    totalEthBalance,
    totalSolBalance,
    hasBalances,
    isBalancesLoading,
    isBalancesError,
    loadingByNetwork: loadingStates,
    errorByNetwork: errorStates,
    errorsByNetwork: errors,
    balancesUpdatedAt: latestUpdatedAt ? new Date(latestUpdatedAt) : null,
    refetchBalances: refetchAllBalances,
    refetchBalancesByNetwork: refetchFunctions,
  };
};
