import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { publicClient } from "@/lib/viem-client";

export interface Balance {
  wei: bigint;
  ether: string;
}

export interface UseBalanceReturn {
  balance: Balance | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Converts wei amount to USD value string with 2 decimal places
 * Uses bigint arithmetic to avoid precision loss
 */
export function weiToUsd(weiAmount: bigint, ethPriceUsd: number): string {
  // Convert USD price to bigint with 8 decimal places for precision
  const USD_DECIMALS = 8;
  const priceInCents = BigInt(Math.round(ethPriceUsd * 10 ** USD_DECIMALS));
  
  // Calculate: (wei * priceInCents) / (10^18 * 10^USD_DECIMALS)
  const divisor = BigInt(10) ** (BigInt(18) + BigInt(USD_DECIMALS));
  const usdValue = (weiAmount * priceInCents) / divisor;
  
  // Format to 2 decimal places
  return (Number(usdValue) / 100).toFixed(2);
}

export function useBalance(address?: string): UseBalanceReturn {
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
    retry: 1,
  });

  return {
    balance: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
