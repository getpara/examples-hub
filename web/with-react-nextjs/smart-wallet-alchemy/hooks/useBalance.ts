import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { publicClient } from "@/lib/viem-client";

export function useBalance(address?: string) {
  const query = useQuery({
    queryKey: ["balance", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("No address provided");
      }

      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      return {
        wei: balance,
        ether: formatEther(balance),
      };
    },
    enabled: !!address,
    staleTime: 15_000, // 15 seconds
    gcTime: 15_000, // 15 seconds (formerly cacheTime)
  });

  return {
    balance: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
