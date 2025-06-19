import { useQuery } from "@tanstack/react-query";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { getSmartWalletAddress } from "@/lib/smart-wallet/core";

export function useSmartWalletAddress(index: number) {
  const para = useClient();
  const { data: wallet } = useWallet();
  const { data: account, isLoading } = useAccount();

  return useQuery({
    queryKey: ["smart-wallet-address", wallet?.id, index],
    queryFn: async () => {
      if (!para || !wallet?.id || !account?.isConnected) {
        throw new Error("Not connected");
      }

      return await getSmartWalletAddress(para, wallet.id, index);
    },
    enabled: !isLoading && !!para && !!wallet?.id && !!account?.isConnected && index >= 0 && index < 3,
  });
}
