/**
 * Centralized API endpoint construction and configuration
 */

export const API_ENDPOINTS = {
  // CoinGecko endpoints
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',
  COINGECKO_PRICE: (ids: string[], currencies = 'usd') =>
    `${API_ENDPOINTS.COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=${currencies}&include_last_updated_at=true`,

  // Placeholder for other API endpoints as they're discovered
  // These would be added as we refactor each hook
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30_000, // 30 seconds
  PRICE_FETCH: 10_000, // 10 seconds for price data
  BALANCE_FETCH: 15_000, // 15 seconds for balance queries
  TRANSACTION_FETCH: 20_000, // 20 seconds for transaction history
} as const;

export const API_HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;
