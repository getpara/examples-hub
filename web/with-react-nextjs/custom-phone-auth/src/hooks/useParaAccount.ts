import { useQuery } from "@tanstack/react-query";
import { para } from "@/lib/para/client";

export function useParaAccount() {
  const { data: isFullyLoggedIn = false, isLoading } = useQuery({
    queryKey: ["paraAccount", "loginStatus"],
    queryFn: async () => {
      return await para.isFullyLoggedIn();
    },
  });

  const { data: wallets = {} } = useQuery({
    queryKey: ["paraAccount", "wallets"],
    queryFn: async () => {
      return await para.getWallets();
    },
    enabled: isFullyLoggedIn,
  });

  const walletsArray = Object.values(wallets);
  const firstWallet = walletsArray[0];
  const address = firstWallet?.address;

  return {
    isConnected: isFullyLoggedIn,
    isLoading,
    address,
    wallets,
    walletCount: walletsArray.length,
  };
}