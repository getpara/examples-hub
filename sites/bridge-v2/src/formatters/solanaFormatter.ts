import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { logger, formatError } from '../logging';

export interface SolanaTransactionParams {
  to: string;
  lamports?: string; // prefer string on wire
  sol?: string; // Alternative to lamports
  feePayer?: string;
  recentBlockhash?: string;
  computeUnitLimit?: number;
  computeUnitPrice?: number | string; // accept string for large ints
}

/**
 * Formats a Solana transaction and returns both the transaction object and base64 message
 * This version is used when we need to reconstruct the complete signed transaction
 */
export async function formatSolanaTransactionWithObject(
  params: SolanaTransactionParams,
  fromAddress: string,
  rpcUrl?: string,
): Promise<{ transaction: Transaction; messageBase64: string }> {
  try {
    logger.info('Formatting Solana transaction', { params, fromAddress });

    // Validate addresses
    const fromPubkey = new PublicKey(fromAddress);
    const toPubkey = new PublicKey(params.to);
    const feePayerPubkey = params.feePayer ? new PublicKey(params.feePayer) : fromPubkey;

    // Calculate lamports
    let lamports: bigint;
    if (params.lamports) {
      lamports = BigInt(params.lamports);
    } else if (params.sol) {
      lamports = BigInt(Math.floor(parseFloat(params.sol) * LAMPORTS_PER_SOL));
    } else {
      throw new Error('Either lamports or sol must be specified');
    }

    // Get recent blockhash if not provided
    let recentBlockhash = params.recentBlockhash;
    if (!recentBlockhash) {
      if (!rpcUrl) {
        throw new Error(
          'RPC URL required to fetch recent blockhash. Either provide recentBlockhash in params or pass rpcUrl to this function.',
        );
      }
      const connection = new Connection(rpcUrl);
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      recentBlockhash = blockhash;
      logger.info('Fetched recent blockhash', { recentBlockhash, rpcUrl });
    }

    // Create transaction
    const transaction = new Transaction();
    transaction.recentBlockhash = recentBlockhash;
    transaction.feePayer = feePayerPubkey;

    // Add compute budget instructions if specified
    const instructions: TransactionInstruction[] = [];

    if (params.computeUnitLimit) {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: params.computeUnitLimit,
        }),
      );
    }

    if (params.computeUnitPrice != null) {
      const microLamports =
        typeof params.computeUnitPrice === 'string' ? Number(BigInt(params.computeUnitPrice)) : params.computeUnitPrice;
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports,
        }),
      );
    }

    // Add transfer instruction
    instructions.push(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      }),
    );

    transaction.add(...instructions);

    // Serialize only the message bytes (matching integration package pattern)
    // Integration calls transaction.serializeMessage() for legacy txs
    const messageBytes = transaction.serializeMessage();

    // Convert to base64
    const base64 = messageBytes.toString('base64');

    logger.info('Solana transaction formatted successfully', { base64 });
    return { transaction, messageBase64: base64 };
  } catch (error) {
    logger.error('Failed to format Solana transaction:', formatError(error));
    throw error;
  }
}

/**
 * Formats a Solana transaction from JSON parameters to base64-encoded binary
 * Following Solana's native serialization format
 */
export async function formatSolanaTransaction(
  params: SolanaTransactionParams,
  fromAddress: string,
  rpcUrl?: string,
): Promise<string> {
  const { messageBase64 } = await formatSolanaTransactionWithObject(params, fromAddress, rpcUrl);
  return messageBase64;
}

/**
 * Formats a Solana message for signing
 * Solana expects the raw message bytes
 */
export function formatSolanaMessage(message: string): string {
  try {
    logger.info('Formatting Solana message', { message });

    // Convert message to base64 (Solana signs raw bytes)
    const messageBase64 = Buffer.from(message, 'utf8').toString('base64');

    logger.info('Solana message formatted successfully', { messageBase64 });
    return messageBase64;
  } catch (error) {
    logger.error('Failed to format Solana message:', formatError(error));
    throw error;
  }
}
