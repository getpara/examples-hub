import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, WalletType, CurrentWalletIds } from "@getpara/react-native-wallet";
import { usePara } from "./usePara";

export const SUPPORTED_WALLET_TYPES = [WalletType.EVM, WalletType.SOLANA] as const;

export type WalletsBySupportedType = {
  [K in (typeof SUPPORTED_WALLET_TYPES)[number]]: Wallet[];
};

const EMPTY_WALLETS: WalletsBySupportedType = {
  [WalletType.EVM]: [],
  [WalletType.SOLANA]: [],
};

export const useWallets = () => {
  const { client, isAuthenticated, isClientLoading } = usePara();
  const queryClient = useQueryClient();
  const WALLETS_QUERY_KEY = ["paraWallets"];

  const {
    data = EMPTY_WALLETS,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WalletsBySupportedType, Error>({
    queryKey: WALLETS_QUERY_KEY,
    queryFn: () => {
      if (!client || !isAuthenticated) {
        return EMPTY_WALLETS;
      }

      try {
        const result = { ...EMPTY_WALLETS };

        for (const type of SUPPORTED_WALLET_TYPES) {
          result[type] = client.getWalletsByType(type).map((wallet) => ({
            ...wallet,
            type,
          }));
        }

        return result;
      } catch (error) {
        throw error instanceof Error ? error : new Error("Failed to fetch wallets");
      }
    },
    enabled: !!client && isAuthenticated,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const createWalletMutation = useMutation<
    [Wallet, string | null],
    Error,
    { type?: WalletType; skipDistribute?: boolean }
  >({
    mutationFn: async (options) => {
      if (!client || !isAuthenticated) {
        throw new Error("Client not initialized or not authenticated");
      }
      return client.createWallet(options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
    },
  });

  const createWalletsPerTypeMutation = useMutation<
    { wallets: Wallet[]; walletIds: CurrentWalletIds; recoverySecret?: string },
    Error,
    { skipDistribute?: boolean; types?: WalletType[] }
  >({
    mutationFn: async (options) => {
      if (!client || !isAuthenticated) {
        throw new Error("Client not initialized or not authenticated");
      }
      return client.createWalletPerType(options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
    },
  });

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
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    createWalletError: createWalletMutation.error,
    resetCreateWallet: createWalletMutation.reset,
    createWalletsPerType: createWalletsPerTypeMutation.mutate,
    isCreatingWalletsPerType: createWalletsPerTypeMutation.isPending,
    createWalletsPerTypeError: createWalletsPerTypeMutation.error,
    resetCreateWalletsPerType: createWalletsPerTypeMutation.reset,
    refetchWallets: refetch,
  };
};
