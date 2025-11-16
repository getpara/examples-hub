import { useQuery } from "@tanstack/react-query";

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

export interface UseEthPriceReturn {
  priceUsd: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useEthPrice(): UseEthPriceReturn {
  const query = useQuery({
    queryKey: ["eth-price"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch ETH price");
      }

      const data = await response.json() as CoinGeckoResponse;
      return data.ethereum.usd;
    },
    staleTime: 3_600_000, // 1 hour
    gcTime: Infinity, // Cache forever
    retry: 1,
  });

  return {
    priceUsd: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}