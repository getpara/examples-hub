import { useQuery } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { checkExistingWallets } from "@/lib/check-existing-wallets";

export function useSmartWallets() {
  const para = useClient();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading } = useAccount();

  const {
    data,
    isLoading: isLoadingWallets,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["smart-wallets", wallet?.id],
    queryFn: async () => {
      if (!para || !wallet?.id || !isConnected) {
        throw new Error("Not connected");
      }

      return await checkExistingWallets(para);
    },
    enabled: !isLoading && !!para && !!wallet?.id && isConnected,
    retry: 1,
    staleTime: 30_000,
  });

  return {
    wallets: data ?? [],
    isLoading: isLoadingWallets,
    isError,
    error,
    refetch,
  };
}
