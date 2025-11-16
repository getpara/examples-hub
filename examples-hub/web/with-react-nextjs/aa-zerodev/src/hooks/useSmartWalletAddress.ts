import { useQuery } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { getSmartWalletAddress } from "@/lib/get-smart-wallet-address";
import { MAX_SMART_WALLETS_PER_EOA } from "@/config/smart-wallet";

export function useSmartWalletAddress(index: number) {
  const para = useClient();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading } = useAccount();

  const { data, isLoading: isLoadingAddress, isError, error } = useQuery({
    queryKey: ["smart-wallet-address", wallet?.id, index],
    queryFn: async () => {
      if (!para || !wallet?.id || !isConnected) {
        throw new Error("Not connected");
      }

      return await getSmartWalletAddress(para, wallet.id, index);
    },
    enabled: !isLoading && !!para && !!wallet?.id && isConnected && index >= 0 && index < MAX_SMART_WALLETS_PER_EOA,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    address: data,
    isLoading: isLoadingAddress,
    isError,
    error,
  };
}
