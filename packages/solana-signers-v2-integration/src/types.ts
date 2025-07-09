import type ParaCore from '@getpara/core-sdk';
import type { Rpc } from '@solana/rpc-spec';
import type { SolanaRpcApi } from '@solana/rpc-api';

/**
 * Configuration parameters for creating a Para Solana Signer
 */
export interface ParaSignerParams {
  /** Para client instance */
  para: ParaCore;
  /** Optional wallet ID. If not provided, will use the first Solana wallet */
  walletId?: string;
  /** RPC client instance for Solana network operations */
  rpc: Rpc<SolanaRpcApi>;
}
