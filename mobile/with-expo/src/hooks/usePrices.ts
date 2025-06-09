import { COINGECKO_API_KEY } from "@/constants/envs";
import { useQuery } from "@tanstack/react-query";

export interface AssetPrice {
  usd: number;
  lastUpdated: Date;
}

export interface AssetPrices {
  ethereum: AssetPrice | null;
  solana: AssetPrice | null;
}

const EMPTY_PRICES: AssetPrices = {
  ethereum: null,
  solana: null,
};

export const usePrices = () => {
  const {
    data = EMPTY_PRICES,
    isLoading: isPricesLoading,
    isError: isPricesError,
    error: pricesError,
    refetch: refetchPrices,
    dataUpdatedAt: pricesUpdatedAt,
  } = useQuery<AssetPrices, Error>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      try {
        const baseUrl = "https://api.coingecko.com/api/v3/simple/price";
        const params = new URLSearchParams({
          ids: "ethereum,solana",
          vs_currencies: "usd",
          include_last_updated_at: "true",
          x_cg_demo_api_key: COINGECKO_API_KEY || "",
        });

        const url = `${baseUrl}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP Error ${response.status}: ${errorText}`);

          if (response.status === 429) {
            throw new Error("Rate limit exceeded");
          }

          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        return {
          ethereum: data.ethereum
            ? {
                usd: data.ethereum.usd,
                lastUpdated: data.ethereum.last_updated_at
                  ? new Date(data.ethereum.last_updated_at * 1000)
                  : new Date(),
              }
            : null,
          solana: data.solana
            ? {
                usd: data.solana.usd,
                lastUpdated: data.solana.last_updated_at ? new Date(data.solana.last_updated_at * 1000) : new Date(),
              }
            : null,
        };
      } catch (error) {
        console.error("Error fetching asset prices:", error);
        throw error;
      }
    },
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const ethPrice = data.ethereum?.usd ?? null;
  const solPrice = data.solana?.usd ?? null;
  const hasPrices = !!ethPrice || !!solPrice;

  return {
    prices: data,
    ethPrice,
    solPrice,
    hasPrices,
    isPricesLoading,
    isPricesError,
    pricesError,
    pricesUpdatedAt: pricesUpdatedAt ? new Date(pricesUpdatedAt) : null,
    refetchPrices,
  };
};
