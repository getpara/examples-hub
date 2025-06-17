/**
 * Centralized polling intervals and stale times for React Query
 * All time values are in milliseconds
 */

export const POLLING_INTERVALS = {
  // Price updates - every minute
  PRICES: 60_000,

  // Balance updates - every 30 seconds
  BALANCES: 30_000,

  // Transaction updates - every 30 seconds
  TRANSACTIONS: 30_000,

  // Wallet list - every 5 minutes (rarely changes)
  WALLETS: 300_000,

  // Default interval for other queries
  DEFAULT: 60_000,
} as const;

export const STALE_TIMES = {
  // Prices become stale after 30 seconds
  PRICES: 30_000,

  // Balances become stale after 15 seconds
  BALANCES: 15_000,

  // Transactions become stale after 15 seconds
  TRANSACTIONS: 15_000,

  // Wallets become stale after 2 minutes
  WALLETS: 120_000,

  // Default stale time
  DEFAULT: 30_000,
} as const;

export const CACHE_TIMES = {
  // Keep price data for 5 minutes
  PRICES: 300_000,

  // Keep balance data for 2 minutes
  BALANCES: 120_000,

  // Keep transaction data for 5 minutes
  TRANSACTIONS: 300_000,

  // Keep wallet data for 10 minutes
  WALLETS: 600_000,

  // Default cache time
  DEFAULT: 300_000,
} as const;

export const RETRY_CONFIG = {
  // Number of retry attempts
  RETRY_COUNT: 3,

  // Retry delay function (exponential backoff)
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30_000),

  // Don't retry on these status codes
  RETRY_BLACKLIST_STATUS: [400, 401, 403, 404],
} as const;
