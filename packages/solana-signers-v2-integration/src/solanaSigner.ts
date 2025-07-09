import ParaCore, { DeniedSignatureResWithUrl, SuccessfulSignatureRes, TransactionReviewError } from '@getpara/core-sdk';
import type {
  TransactionPartialSigner,
  TransactionModifyingSigner,
  TransactionSendingSigner,
  MessagePartialSigner,
  MessageModifyingSigner,
  SignatureDictionary,
  SignableMessage,
  TransactionPartialSignerConfig,
  TransactionModifyingSignerConfig,
  TransactionSendingSignerConfig,
  MessagePartialSignerConfig,
  MessageModifyingSignerConfig,
} from '@solana/signers';
import type { Address } from '@solana/addresses';
import type { Transaction } from '@solana/transactions';
import { getBase64EncodedWireTransaction } from '@solana/transactions';
import type { SignatureBytes } from '@solana/keys';
import { getAddressEncoder } from '@solana/addresses';
import type { SolanaRpcApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';
import bs58 from 'bs58';
import type { ParaSignerParams } from './types.js';

/**
 * Para Solana Signer implementation for Solana v2 signers specification
 *
 * This signer integrates Para SDK with Solana's new v2 signer interfaces.
 *
 * @example
 * ```typescript
 * import { ParaSolanaSigner } from '@getpara/solana-signers-v2-integration';
 * import { createRpc } from '@solana/rpc-spec';
 * import { createSolanaRpcApi } from '@solana/rpc-api';
 * import { createHttpTransport } from '@solana/rpc-transport-http';
 *
 * const transport = createHttpTransport({ url: 'https://api.devnet.solana.com' });
 * const api = createSolanaRpcApi();
 * const rpc = createRpc({ api, transport });
 *
 * const signer = new ParaSolanaSigner({
 *   para: paraClient,
 *   rpc
 * });
 *
 * // Sign and send a transaction
 * const signatures = await signer.signAndSendTransactions([transaction]);
 * ```
 */
export class ParaSolanaSigner
  implements
    TransactionPartialSigner,
    TransactionModifyingSigner,
    TransactionSendingSigner,
    MessagePartialSigner,
    MessageModifyingSigner
{
  private para: ParaCore;
  private walletId: string;
  private rpc: Rpc<SolanaRpcApi>;
  public readonly address: Address;
  public readonly sender: Uint8Array;

  constructor(params: ParaSignerParams) {
    if (!params.para) {
      throw new Error('ParaSolanaSigner: `para` parameter is required');
    }

    if (!params.rpc) {
      throw new Error('ParaSolanaSigner: `rpc` parameter is required');
    }

    this.para = params.para;
    this.rpc = params.rpc;

    try {
      this.walletId = params.para.findWalletId(params.walletId, { type: ['SOLANA'] });
    } catch (error) {
      throw new Error(
        `ParaSolanaSigner: Failed to find Solana wallet. ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    if (!params.para.wallets[this.walletId]?.address) {
      throw new Error('ParaSolanaSigner: Wallet address not found');
    }

    this.address = params.para.wallets[this.walletId].address as Address;
    this.sender = new Uint8Array(getAddressEncoder().encode(this.address));
  }

  /**
   * Sign one or more transactions
   * @param transactions - Array of transactions to sign
   * @param config - Optional configuration including abort signal
   * @returns Array of signature dictionaries
   */
  async signTransactions(
    transactions: readonly Transaction[],
    config?: TransactionPartialSignerConfig,
  ): Promise<readonly SignatureDictionary[]> {
    if (!transactions || transactions.length === 0) {
      throw new Error('ParaSolanaSigner: No transactions provided to sign');
    }

    // Check for abort signal before starting
    if (config?.abortSignal?.aborted) {
      throw new Error('ParaSolanaSigner: Operation was aborted before starting');
    }

    const signatures: SignatureDictionary[] = [];

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      // Check for abort signal before each signing operation
      if (config?.abortSignal?.aborted) {
        throw new Error(
          `ParaSolanaSigner: Operation was aborted while signing transaction ${i + 1} of ${transactions.length}`,
        );
      }

      if (!transaction.messageBytes || transaction.messageBytes.length === 0) {
        throw new Error(`ParaSolanaSigner: Transaction ${i + 1} has no message bytes to sign`);
      }

      const messageBase64 = Buffer.from(transaction.messageBytes).toString('base64');

      try {
        const res = await this.para.signMessage({
          walletId: this.walletId,
          messageBase64,
        });

        if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
          throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
        }

        const signatureBytes = Buffer.from((res as SuccessfulSignatureRes).signature, 'base64');
        const signatureDictionary: SignatureDictionary = {
          [this.address]: signatureBytes as unknown as SignatureBytes,
        };

        signatures.push(signatureDictionary);
      } catch (error) {
        if (error instanceof TransactionReviewError) {
          throw error;
        }
        throw new Error(
          `ParaSolanaSigner: Failed to sign transaction ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return signatures;
  }

  async modifyAndSignTransactions<T extends Transaction>(
    transactions: readonly T[],
    config?: TransactionModifyingSignerConfig,
  ): Promise<readonly T[]> {
    // For now, we don't modify transactions, just sign them
    // This could be extended to add compute budget instructions or other modifications
    const signatureDictionaries = await this.signTransactions(transactions, config);

    // Apply signatures to transactions
    const signedTransactions = transactions.map((transaction, index) => {
      const signatureDictionary = signatureDictionaries[index];

      // Create a new transaction with the signature applied
      // Merge existing signatures with new signatures
      const existingSignatures = transaction.signatures || {};
      return {
        ...transaction,
        signatures: {
          ...existingSignatures,
          ...signatureDictionary,
        },
      } as T;
    });

    return signedTransactions;
  }

  /**
   * Sign and send transactions to the network
   * @param transactions - Array of transactions to sign and send
   * @param config - Optional configuration including abort signal
   * @returns Array of transaction signatures
   * @throws Error if no RPC client is configured
   */
  async signAndSendTransactions(
    transactions: readonly Transaction[],
    config?: TransactionSendingSignerConfig,
  ): Promise<readonly SignatureBytes[]> {
    if (!transactions || transactions.length === 0) {
      throw new Error('ParaSolanaSigner: No transactions provided to send');
    }

    // First, sign the transactions
    const signedTransactions = await this.modifyAndSignTransactions(transactions, config);

    const sentSignatures: SignatureBytes[] = [];

    for (let i = 0; i < signedTransactions.length; i++) {
      const signedTransaction = signedTransactions[i];

      // Check for abort signal before each send operation
      if (config?.abortSignal?.aborted) {
        throw new Error(
          `ParaSolanaSigner: Operation was aborted while sending transaction ${i + 1} of ${signedTransactions.length}`,
        );
      }

      try {
        // Serialize the signed transaction to wire format
        const serializedTransaction = getBase64EncodedWireTransaction(signedTransaction);

        // Send the transaction via Solana RPC
        const signatureBase58 = await this.rpc
          .sendTransaction(serializedTransaction, {
            encoding: 'base64',
            skipPreflight: false,
            preflightCommitment: 'processed',
          })
          .send({ abortSignal: config?.abortSignal });

        // Convert base58 signature to bytes
        const signatureBytes = bs58.decode(signatureBase58 as unknown as string);
        sentSignatures.push(signatureBytes as SignatureBytes);
      } catch (error) {
        throw new Error(
          `ParaSolanaSigner: Failed to send transaction ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return sentSignatures;
  }

  /**
   * Sign one or more messages
   * @param messages - Array of messages to sign
   * @param config - Optional configuration including abort signal
   * @returns Array of signature dictionaries
   */
  async signMessages(
    messages: readonly SignableMessage[],
    config?: MessagePartialSignerConfig,
  ): Promise<readonly SignatureDictionary[]> {
    if (!messages || messages.length === 0) {
      throw new Error('ParaSolanaSigner: No messages provided to sign');
    }

    // Check for abort signal before starting
    if (config?.abortSignal?.aborted) {
      throw new Error('ParaSolanaSigner: Operation was aborted before starting');
    }

    const signatures: SignatureDictionary[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Check for abort signal before each signing operation
      if (config?.abortSignal?.aborted) {
        throw new Error(`ParaSolanaSigner: Operation was aborted while signing message ${i + 1} of ${messages.length}`);
      }

      if (!message.content || message.content.length === 0) {
        throw new Error(`ParaSolanaSigner: Message ${i + 1} has no content to sign`);
      }

      const messageBase64 = Buffer.from(message.content).toString('base64');

      try {
        const res = await this.para.signMessage({
          walletId: this.walletId,
          messageBase64,
        });

        if ((res as DeniedSignatureResWithUrl).transactionReviewUrl) {
          throw new TransactionReviewError((res as DeniedSignatureResWithUrl).transactionReviewUrl);
        }

        const signatureBytes = Buffer.from((res as SuccessfulSignatureRes).signature, 'base64');
        const signatureDictionary: SignatureDictionary = {
          [this.address]: signatureBytes as unknown as SignatureBytes,
        };

        signatures.push(signatureDictionary);
      } catch (error) {
        if (error instanceof TransactionReviewError) {
          throw error;
        }
        throw new Error(
          `ParaSolanaSigner: Failed to sign message ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return signatures;
  }

  async modifyAndSignMessages(
    messages: readonly SignableMessage[],
    config?: MessageModifyingSignerConfig,
  ): Promise<readonly SignableMessage[]> {
    // For now, we don't modify messages, just sign them
    // This could be extended to add metadata or other modifications
    const signatureDictionaries = await this.signMessages(messages, config);

    // Return messages with signatures applied
    return messages.map((message, index) => ({
      ...message,
      signatures: {
        ...message.signatures,
        ...signatureDictionaries[index],
      },
    }));
  }
}
