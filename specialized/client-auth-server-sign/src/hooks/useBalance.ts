import { useQuery } from "@tanstack/react-query";
import { formatEther } from "ethers";
import { useEthers } from "./useEthers";

export function useBalance(address?: string) {
  const { provider } = useEthers();

  return useQuery({
    queryKey: ["balance", address],
    queryFn: async () => {
      if (!address || !provider) {
        return null;
      }
      
      const balanceWei = await provider.getBalance(address);
      return formatEther(balanceWei);
    },
    enabled: !!address && !!provider,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}