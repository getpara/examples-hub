import ParaCore from '@getpara/core-sdk';
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

/**
 * Creates a Solana Devnet test transaction to sign and validate that your Para application is properly working.
 * The transaction, if broadcast, simply sends 0.01 SOL from the wallet back to itself.
 * @param {ParaCore} para your Para instance
 * @param {string} walletId the Solana wallet ID to use.
 * @returns {Promise<Transaction>} the generated transaction.
 */
export async function createTestTransaction(para: ParaCore, walletId?: string): Promise<Transaction> {
  walletId = para.findWalletId(walletId, { type: ['SOLANA'] });

  const connection = new Connection(clusterApiUrl('devnet'));
  const wallet = para.wallets[walletId];
  const address = para.getDisplayAddress(wallet.id, { addressType: 'SOLANA' });
  const mePublicKey = new PublicKey(address);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  return new Transaction({
    feePayer: mePublicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 120000,
    }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 500,
    }),
    SystemProgram.transfer({
      fromPubkey: mePublicKey,
      toPubkey: mePublicKey,
      lamports: 0.01 * LAMPORTS_PER_SOL,
    }),
  );
}
