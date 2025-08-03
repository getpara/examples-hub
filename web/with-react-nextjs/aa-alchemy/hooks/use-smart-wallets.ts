import { useQuery } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { checkExistingWallets } from "@/lib/smart-wallet/core";

export function useSmartWallets() {
  const para = useClient();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading } = useAccount();

  const query = useQuery({
    queryKey: ["smart-wallets", wallet?.id],
    queryFn: async () => {
      if (!para || !wallet?.id || !isConnected) {
        throw new Error("Not connected");
      }

      return await checkExistingWallets(para, wallet.id);
    },
    enabled: !isLoading && !!para && !!wallet?.id && isConnected,
    retry: 1,
    staleTime: 30_000, // 30 seconds
  });

  return {
    ...query,
    isError: query.isError,
    error: query.error,
  };
}
