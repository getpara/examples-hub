import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  WalletType,
  CurrentWalletIds,
} from '@getpara/react-native-wallet';
import { usePara } from './usePara';
import { SUPPORTED_WALLET_TYPES, WalletsBySupportedType } from '@/types';
import { QUERY_KEYS, MUTATION_KEYS } from '@/constants/queryKeys';
import {
  createAuthDependentQueryOptions,
  createMutationOptions,
} from '@/utils/queryUtils';

const EMPTY_WALLETS: WalletsBySupportedType = {
  [WalletType.EVM]: [],
  [WalletType.SOLANA]: [],
};

// Read-only hook for wallet list
export const useWalletList = () => {
  const { paraClient, isAuthenticated, isClientLoading } = usePara();

  const {
    data = EMPTY_WALLETS,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WalletsBySupportedType, Error>(
    createAuthDependentQueryOptions(!!paraClient && isAuthenticated, {
      queryKey: QUERY_KEYS.WALLETS,
      queryFn: () => {
        if (!paraClient || !isAuthenticated) {
          return EMPTY_WALLETS;
        }

        try {
          const result = { ...EMPTY_WALLETS };

          for (const type of SUPPORTED_WALLET_TYPES) {
            result[type] = paraClient.getWalletsByType(type).map((wallet) => ({
              ...wallet,
              type,
            }));
          }

          return result;
        } catch (error) {
          throw error instanceof Error
            ? error
            : new Error('Failed to fetch wallets');
        }
      },
      staleTime: Infinity,
      gcTime: Infinity,
    })
  );

  const evmWallets = data[WalletType.EVM];
  const solanaWallets = data[WalletType.SOLANA];
  const hasEvmWallets = evmWallets.length > 0;
  const hasSolanaWallets = solanaWallets.length > 0;
  const hasWallets = hasEvmWallets || hasSolanaWallets;

  return {
    wallets: data,
    evmWallets,
    solanaWallets,
    hasEvmWallets,
    hasSolanaWallets,
    hasWallets,
    isWalletsLoading: isLoading || (isClientLoading && !hasWallets),
    isWalletsError: isError,
    walletsError: error,
    refetchWallets: refetch,
  };
};

// Write operations hook for wallet actions
export const useWalletActions = () => {
  const { paraClient, isAuthenticated } = usePara();
  const queryClient = useQueryClient();

  const createWalletMutation = useMutation<
    [Wallet, string | null],
    Error,
    { type?: WalletType; skipDistribute?: boolean }
  >(
    createMutationOptions({
      mutationKey: MUTATION_KEYS.CREATE_WALLET,
      mutationFn: async (options) => {
        if (!paraClient || !isAuthenticated) {
          throw new Error('Client not initialized or not authenticated');
        }
        return paraClient.createWallet(options);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIGNERS });
      },
    })
  );

  const createWalletsPerTypeMutation = useMutation<
    { wallets: Wallet[]; walletIds: CurrentWalletIds; recoverySecret?: string },
    Error,
    { skipDistribute?: boolean; types?: WalletType[] }
  >(
    createMutationOptions({
      mutationKey: MUTATION_KEYS.CREATE_WALLET,
      mutationFn: async (options) => {
        if (!paraClient || !isAuthenticated) {
          throw new Error('Client not initialized or not authenticated');
        }
        return paraClient.createWalletPerType(options);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIGNERS });
      },
    })
  );

  return {
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    createWalletError: createWalletMutation.error,
    resetCreateWallet: createWalletMutation.reset,
    createWalletsPerType: createWalletsPerTypeMutation.mutate,
    isCreatingWalletsPerType: createWalletsPerTypeMutation.isPending,
    createWalletsPerTypeError: createWalletsPerTypeMutation.error,
    resetCreateWalletsPerType: createWalletsPerTypeMutation.reset,
  };
};

// Combined hook for backward compatibility
export const useWallets = () => {
  const walletList = useWalletList();
  const walletActions = useWalletActions();

  return {
    ...walletList,
    ...walletActions,
  };
};
