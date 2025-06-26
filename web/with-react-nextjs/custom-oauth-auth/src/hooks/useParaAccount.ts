import { useQuery } from "@tanstack/react-query";
import { para } from "@/lib/para/client";

export function useParaAccount() {
  // Check if user is fully logged in
  const { data: isLoggedIn = false, isLoading: isCheckingAuth } = useQuery({
    queryKey: ["paraAccount", "isLoggedIn"],
    queryFn: async () => {
      return await para.isFullyLoggedIn();
    },
    refetchInterval: 2000, // Check every 2 seconds for faster updates
    refetchIntervalInBackground: true,
  });

  // Get wallet address if logged in
  const { data: walletAddress, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["paraAccount", "wallet"],
    queryFn: async () => {
      const wallets = Object.values(await para.getWallets());
      return wallets?.[0]?.address || null;
    },
    enabled: isLoggedIn,
  });

  return {
    isConnected: isLoggedIn,
    address: walletAddress,
    isLoading: isCheckingAuth || isLoadingWallet,
  };
}