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
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");

        if (!response.ok) {
          console.error(`Failed to fetch ETH price: ${response.status} ${response.statusText}`);
          throw new Error("Failed to fetch ETH price");
        }

        const data = (await response.json()) as CoinGeckoResponse;
        return data.ethereum.usd;
      } catch (error) {
        // Log error for debugging but don't expose internal details to UI
        console.error("Error fetching ETH price:", error);
        throw new Error("Unable to fetch current ETH price");
      }
    },
    staleTime: 3_600_000,
    gcTime: Infinity,
    retry: 1,
  });

  return {
    priceUsd: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
