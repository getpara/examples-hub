export * from './evmFormatter';
export * from './solanaFormatter';
export { formatCosmosTransaction, formatCosmosMessage } from './cosmosFormatter';
export type { CosmosTransactionParams } from './cosmosFormatter';

import { formatEVMTransaction, formatEVMMessage, EVMTransactionParams } from './evmFormatter';
import { formatSolanaTransaction, formatSolanaMessage, SolanaTransactionParams } from './solanaFormatter';
import { formatCosmosMessage, CosmosTransactionParams } from './cosmosFormatter';
import { logger } from '../logging';

/**
 * Pre-serialized transaction format for direct signing
 * Used when the transaction is already formatted/serialized by the client
 */
export interface PreSerializedTransaction {
  type: 'serialized';
  data: string; // Base64-encoded transaction data
}

export type TransactionParams =
  | EVMTransactionParams
  | SolanaTransactionParams
  | CosmosTransactionParams
  | PreSerializedTransaction;

/**
 * Formats a transaction based on wallet type
 */
export async function formatTransaction(
  params: TransactionParams,
  walletType: string,
  fromAddress: string,
  chainId?: string,
  publicKey?: Uint8Array,
  rpcUrl?: string,
): Promise<string> {
  logger.info('Formatting transaction for wallet type', { walletType, params });

  // Handle pre-serialized transactions
  if ('type' in params && params.type === 'serialized') {
    logger.info('Transaction is already serialized, returning as-is');
    return params.data;
  }

  switch (walletType.toUpperCase()) {
    case 'EVM':
      return formatEVMTransaction(params as EVMTransactionParams, fromAddress, chainId);

    case 'SOLANA':
      return formatSolanaTransaction(params as SolanaTransactionParams, fromAddress, rpcUrl);

    case 'COSMOS':
      // Cosmos requires special handling due to its unique signing requirements:
      // - Returns both signBytes AND signDoc (needed for transaction preview UI)
      // - Supports both Proto and Amino formats with different hashing methods
      // - Must be called directly via formatCosmosTransaction(), not through this generic wrapper
      // This architectural difference prevents Cosmos from using the unified interface.
      throw new Error('Cosmos transactions should be handled through formatAndSignTransaction in bridgeMethodHandlers');

    default:
      throw new Error(`Unsupported wallet type for formatting: ${walletType}`);
  }
}

/**
 * Formats a message based on wallet type
 */
export function formatMessage(message: string, walletType: string, signerAddress?: string): string {
  logger.info('Formatting message for wallet type', { walletType, message });

  switch (walletType.toUpperCase()) {
    case 'EVM':
      return formatEVMMessage(message);

    case 'SOLANA':
      return formatSolanaMessage(message);

    case 'COSMOS':
      if (!signerAddress) {
        throw new Error('Signer address required for Cosmos message formatting');
      }
      return formatCosmosMessage(message, signerAddress);

    default:
      throw new Error(`Unsupported wallet type for formatting: ${walletType}`);
  }
}
