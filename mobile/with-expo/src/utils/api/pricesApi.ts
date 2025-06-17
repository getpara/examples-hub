/**
 * Price fetching API utilities
 * Extracted from usePrices hook for better testability and reusability
 */

import { API_ENDPOINTS, API_TIMEOUTS } from '@/constants/apiEndpoints';
import { handleQueryError } from '@/utils/queryUtils';

export interface PriceData {
  [tokenId: string]: {
    usd: number;
    lastUpdated: Date | null;
  };
}

export interface CoinGeckoResponse {
  [tokenId: string]: {
    usd: number;
    last_updated_at?: number;
  };
}

/**
 * Fetch token prices from CoinGecko API
 */
export async function fetchTokenPrices(tokenIds: string[]): Promise<PriceData> {
  if (tokenIds.length === 0) {
    return {};
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    API_TIMEOUTS.PRICE_FETCH
  );

  try {
    const url = API_ENDPOINTS.COINGECKO_PRICE(tokenIds);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      );
    }

    const data: CoinGeckoResponse = await response.json();

    // Transform the response to our format
    const prices: PriceData = {};

    for (const [tokenId, priceInfo] of Object.entries(data)) {
      prices[tokenId] = {
        usd: priceInfo.usd || 0,
        lastUpdated: priceInfo.last_updated_at
          ? new Date(priceInfo.last_updated_at * 1000)
          : null,
      };
    }

    return prices;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(
        `Price fetch timeout after ${API_TIMEOUTS.PRICE_FETCH}ms`
      );
    }
    throw handleQueryError(error);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Map network symbols to CoinGecko IDs
 */
export const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  ETH: 'ethereum',
  MATIC: 'matic-network',
  BNB: 'binancecoin',
  AVAX: 'avalanche-2',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
} as const;

/**
 * Convert token symbols to CoinGecko IDs
 */
export function symbolsToCoinGeckoIds(symbols: string[]): string[] {
  return symbols
    .map((symbol) => SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()])
    .filter(Boolean);
}
