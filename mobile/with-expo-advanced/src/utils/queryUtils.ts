/**
 * React Query configuration helpers and utilities
 */

import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  POLLING_INTERVALS,
  STALE_TIMES,
  CACHE_TIMES,
  RETRY_CONFIG,
} from '@/constants/polling';

/**
 * Default query options factory
 */
export function createQueryOptions<TData = unknown, TError = Error>(
  options?: Partial<UseQueryOptions<TData, TError>>
): UseQueryOptions<TData, TError> {
  return {
    staleTime: STALE_TIMES.DEFAULT,
    gcTime: CACHE_TIMES.DEFAULT,
    refetchInterval: POLLING_INTERVALS.DEFAULT,
    retry: RETRY_CONFIG.RETRY_COUNT,
    retryDelay: RETRY_CONFIG.RETRY_DELAY,
    ...options,
  } as UseQueryOptions<TData, TError>;
}

/**
 * Create query options for balance queries
 */
export function createBalanceQueryOptions<TData = unknown>(
  options?: Partial<UseQueryOptions<TData>>
): UseQueryOptions<TData> {
  return createQueryOptions({
    staleTime: STALE_TIMES.BALANCES,
    gcTime: CACHE_TIMES.BALANCES,
    refetchInterval: POLLING_INTERVALS.BALANCES,
    ...options,
  });
}

/**
 * Create query options for transaction queries
 */
export function createTransactionQueryOptions<TData = unknown>(
  options?: Partial<UseQueryOptions<TData>>
): UseQueryOptions<TData> {
  return createQueryOptions({
    staleTime: STALE_TIMES.TRANSACTIONS,
    gcTime: CACHE_TIMES.TRANSACTIONS,
    refetchInterval: POLLING_INTERVALS.TRANSACTIONS,
    ...options,
  });
}

/**
 * Create query options for price queries
 */
export function createPriceQueryOptions<TData = unknown>(
  options?: Partial<UseQueryOptions<TData>>
): UseQueryOptions<TData> {
  return createQueryOptions({
    staleTime: STALE_TIMES.PRICES,
    gcTime: CACHE_TIMES.PRICES,
    refetchInterval: POLLING_INTERVALS.PRICES,
    ...options,
  });
}

/**
 * Create query options for auth-dependent queries
 */
export function createAuthDependentQueryOptions<TData = unknown>(
  enabled: boolean,
  options?: Partial<UseQueryOptions<TData>>
): UseQueryOptions<TData> {
  return createQueryOptions({
    enabled,
    retry: false, // Don't retry auth-dependent queries
    ...options,
  });
}

/**
 * Default mutation options factory
 */
export function createMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  options?: Partial<UseMutationOptions<TData, TError, TVariables>>
): UseMutationOptions<TData, TError, TVariables> {
  return {
    retry: false, // Mutations typically shouldn't retry automatically
    ...options,
  };
}

/**
 * Check if an HTTP status code should trigger a retry
 */
export function shouldRetryRequest(
  failureCount: number,
  error: unknown
): boolean {
  if (failureCount >= RETRY_CONFIG.RETRY_COUNT) {
    return false;
  }

  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status;
    return !RETRY_CONFIG.RETRY_BLACKLIST_STATUS.includes(
      status as 400 | 401 | 403 | 404
    );
  }

  return true;
}

/**
 * Create a stable query key from an array of wallet IDs
 */
export function createStableWalletKey(walletIds: string[]): string {
  return walletIds.slice().sort().join(',');
}

/**
 * Type-safe error handler for queries
 */
export function handleQueryError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String(error.message));
  }

  return new Error('An unknown error occurred');
}
