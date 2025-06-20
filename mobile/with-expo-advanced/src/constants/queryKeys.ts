/**
 * Centralized query key management for React Query
 * All query keys should be defined here to ensure consistency and prevent collisions
 */

export const QUERY_KEYS = {
  // Authentication
  PARA_AUTH_STATUS: ['paraAuthStatus'] as const,

  // Wallets
  WALLETS: ['wallets'] as const,
  WALLETS_BY_USER: (userId: string) => ['wallets', userId] as const,

  // Signers
  SIGNERS: ['signers'] as const,

  // Balances
  BALANCES: ['balances'] as const,
  BALANCES_BY_WALLETS: (walletIds: string) => ['balances', walletIds] as const,

  // Transactions
  TRANSACTIONS: ['transactions'] as const,
  TRANSACTIONS_BY_WALLETS: (walletIds: string[]) =>
    ['transactions', ...walletIds] as const,

  // Prices
  PRICES: ['prices'] as const,
  PRICES_BY_TOKENS: (tokenIds: string[]) => ['prices', ...tokenIds] as const,
} as const;

/**
 * Mutation keys for React Query mutations
 */
export const MUTATION_KEYS = {
  // Authentication
  PARA_LOGIN: ['paraLogin'] as const,
  PARA_LOGOUT: ['paraLogout'] as const,
  PARA_REGISTER_PASSKEY: ['paraRegisterPasskey'] as const,

  // Wallets
  CREATE_WALLET: ['createWallet'] as const,
  UPDATE_WALLET: ['updateWallet'] as const,
  DELETE_WALLET: ['deleteWallet'] as const,
} as const;
