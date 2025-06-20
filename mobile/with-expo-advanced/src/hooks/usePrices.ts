import { useQuery } from '@tanstack/react-query';
import { fetchTokenPrices, symbolsToCoinGeckoIds } from '@/utils/api/pricesApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { createPriceQueryOptions } from '@/utils/queryUtils';

export interface AssetPrice {
  usd: number;
  lastUpdated: Date | null;
}

export interface AssetPrices {
  ethereum: AssetPrice | null;
  solana: AssetPrice | null;
}

const EMPTY_PRICES: AssetPrices = {
  ethereum: null,
  solana: null,
};

const TOKEN_SYMBOLS = ['ETH', 'SOL'];

export const usePrices = () => {
  const coinGeckoIds = symbolsToCoinGeckoIds(TOKEN_SYMBOLS);

  const {
    data = EMPTY_PRICES,
    isLoading: isPricesLoading,
    isError: isPricesError,
    error: pricesError,
    refetch: refetchPrices,
    dataUpdatedAt: pricesUpdatedAt,
  } = useQuery<AssetPrices, Error>(
    createPriceQueryOptions({
      queryKey: QUERY_KEYS.PRICES_BY_TOKENS(coinGeckoIds),
      queryFn: async () => {
        const priceData = await fetchTokenPrices(coinGeckoIds);

        // Transform to our expected format
        return {
          ethereum: priceData.ethereum
            ? {
                usd: priceData.ethereum.usd,
                lastUpdated: priceData.ethereum.lastUpdated,
              }
            : null,
          solana: priceData.solana
            ? {
                usd: priceData.solana.usd,
                lastUpdated: priceData.solana.lastUpdated,
              }
            : null,
        };
      },
    })
  );

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
