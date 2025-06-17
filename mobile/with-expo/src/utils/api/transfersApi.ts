/**
 * Transaction/Transfer fetching API utilities
 * Extracted from useTransactions hook for better testability and reusability
 */

import { Wallet, Network, WalletType } from '@getpara/react-native-wallet';
import { formatUnits, JsonRpcProvider } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  TRANSACTION_LIMITS,
  getNetworkConfig,
  NATIVE_TOKEN_PLACEHOLDER,
} from '@/constants/networks';
import { handleQueryError } from '@/utils/queryUtils';

export interface Transfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  decimals: number;
  network: Network | string;
  timestamp: number;
  fee?: string;
  status: 'confirmed' | 'pending' | 'failed';
  tokenAddress?: string;
  blockNumber?: number;
}

/**
 * Fetch EVM transfers with pagination support
 */
export async function fetchEvmTransfers(
  wallet: Wallet,
  provider: JsonRpcProvider,
  maxPages: number = TRANSACTION_LIMITS.MAX_PAGES
): Promise<Transfer[]> {
  if (!wallet.address) {
    throw new Error('Wallet address is undefined');
  }

  try {
    const transfers: Transfer[] = [];
    // Default to ethereum config for EVM wallets
    // const networkConfig = getNetworkConfig('ethereum');

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    // let fromBlock = Math.max(0, currentBlock - 10000); // Look back ~10k blocks

    // Simple pagination - this is a placeholder for actual implementation
    // In production, you'd use an indexer service like Etherscan API
    for (let page = 0; page < maxPages; page++) {
      try {
        // This is a simplified example - real implementation would use event logs
        const block = await provider.getBlock(currentBlock - page * 100);
        if (!block || block.transactions.length === 0) continue;

        // Process transactions in the block
        for (const txHash of block.transactions.slice(0, 10)) {
          try {
            const tx = await provider.getTransaction(txHash);
            const receipt = await provider.getTransactionReceipt(txHash);

            if (!tx || !receipt) continue;

            // Check if transaction involves our wallet
            if (
              tx.from?.toLowerCase() === wallet.address.toLowerCase() ||
              tx.to?.toLowerCase() === wallet.address.toLowerCase()
            ) {
              const transfer: Transfer = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: formatUnits(tx.value, 18), // All EVM chains use 18 decimals
                symbol: 'ETH', // Default to ETH, could be parameterized
                decimals: 18,
                network:
                  wallet.type === WalletType.SOLANA
                    ? Network.SOLANA
                    : Network.ETHEREUM,
                timestamp: block.timestamp * 1000,
                fee: formatUnits(
                  (
                    receipt.gasUsed *
                    (tx.maxFeePerGas || tx.gasPrice || BigInt(0))
                  ).toString(),
                  18
                ),
                status: receipt.status === 1 ? 'confirmed' : 'failed',
                tokenAddress: NATIVE_TOKEN_PLACEHOLDER,
                blockNumber: block.number,
              };

              transfers.push(transfer);
            }
          } catch (txError) {
            console.error(`Error processing transaction ${txHash}:`, txError);
            // Continue with next transaction
          }
        }
      } catch (blockError) {
        console.error(`Error processing block:`, blockError);
        // Continue with next page
      }
    }

    return transfers;
  } catch (error) {
    throw handleQueryError(error);
  }
}

/**
 * Fetch Solana transfers
 */
export async function fetchSolanaTransfers(
  wallet: Wallet,
  connection: Connection,
  limit: number = TRANSACTION_LIMITS.DEFAULT_PAGE_SIZE
): Promise<Transfer[]> {
  if (!wallet.address) {
    throw new Error('Wallet address is undefined');
  }

  try {
    const publicKey = new PublicKey(wallet.address);
    const networkConfig = getNetworkConfig('solana');

    // Get transaction signatures
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });

    if (signatures.length === 0) {
      return [];
    }

    // Fetch transaction details
    const transfers: Transfer[] = [];

    for (const sig of signatures) {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta) continue;

        // Extract transfer info from parsed instructions
        const transfer: Transfer = {
          hash: sig.signature,
          from: wallet.address,
          to: '', // Will be extracted from instructions
          value: '0',
          symbol: networkConfig.symbol,
          decimals: networkConfig.decimals,
          network: Network.SOLANA,
          timestamp: (sig.blockTime || 0) * 1000,
          fee: ((tx.meta.fee || 0) / LAMPORTS_PER_SOL).toString(),
          status: tx.meta.err ? 'failed' : 'confirmed',
          tokenAddress: NATIVE_TOKEN_PLACEHOLDER,
        };

        // Simple extraction of transfer amount from balance changes
        if (tx.meta.postBalances && tx.meta.preBalances) {
          const balanceChange =
            tx.meta.postBalances[0] - tx.meta.preBalances[0];
          transfer.value = Math.abs(
            balanceChange / LAMPORTS_PER_SOL
          ).toString();
        }

        transfers.push(transfer);
      } catch (txError) {
        console.error(
          `Error processing Solana transaction ${sig.signature}:`,
          txError
        );
        // Continue with next transaction
      }
    }

    return transfers;
  } catch (error) {
    throw handleQueryError(error);
  }
}

/**
 * Fetch transfers for multiple wallets using Promise.allSettled
 */
interface SignerWithProvider {
  provider: JsonRpcProvider;
}

interface SignerWithConnection {
  connection: Connection;
}

export async function fetchAllWalletTransfers(
  wallets: Wallet[],
  signers: Record<string, SignerWithProvider | SignerWithConnection>
): Promise<Transfer[]> {
  const transferPromises = wallets.map(async (wallet) => {
    const signer = signers[wallet.id];
    if (!signer) {
      throw new Error(`No signer available for wallet ${wallet.id}`);
    }

    try {
      if (wallet.type === WalletType.SOLANA) {
        return await fetchSolanaTransfers(
          wallet,
          (signer as SignerWithConnection).connection
        );
      } else {
        return await fetchEvmTransfers(
          wallet,
          (signer as SignerWithProvider).provider
        );
      }
    } catch (error) {
      throw new Error(
        `Fetching transfers failed for wallet ${wallet.address}: ${(error as Error).message}`
      );
    }
  });

  // Use Promise.allSettled so one failure doesn't cancel all
  const results = await Promise.allSettled(transferPromises);

  // Collect successful results and log failures
  const allTransfers: Transfer[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allTransfers.push(...result.value);
    } else {
      console.error(
        `Failed to fetch transfers for wallet ${wallets[index].id}:`,
        result.reason
      );
    }
  });

  // Sort by timestamp (newest first)
  return allTransfers.sort((a, b) => b.timestamp - a.timestamp);
}
