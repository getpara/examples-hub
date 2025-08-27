import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { StargateClient } from '@cosmjs/stargate';
import { logger } from '../logging';

/**
 * Get balance for any blockchain by wallet type
 */
export async function getBlockchainBalance(
  address: string,
  walletType: string,
  options?: {
    rpcUrl?: string;
    token?: string;
    denom?: string;
  },
): Promise<string> {
  switch (walletType) {
    case 'EVM':
      return getEVMBalance(address, options?.rpcUrl);

    case 'SOLANA':
      return getSolanaBalance(address, options?.rpcUrl);

    case 'COSMOS':
      return getCosmosBalance(address, options?.rpcUrl, options?.denom);

    default:
      throw new Error(`Unsupported wallet type for balance: ${walletType}`);
  }
}

/**
 * Get EVM balance in wei
 */
async function getEVMBalance(address: string, rpcUrl?: string): Promise<string> {
  try {
    logger.info('Getting EVM balance', { address, rpcUrl });

    const url = rpcUrl || 'https://eth.llamarpc.com';
    const provider = new ethers.JsonRpcProvider(url);
    const balance = await provider.getBalance(address);

    logger.info('EVM balance retrieved', { address, balance: balance.toString() });
    return balance.toString();
  } catch (error) {
    logger.error('Failed to get EVM balance:', error);
    throw error;
  }
}

/**
 * Get Solana balance in lamports
 */
async function getSolanaBalance(address: string, rpcUrl?: string): Promise<string> {
  // Use RPC URL provided by SDK, or fall back to devnet for testing
  const url = rpcUrl || 'https://api.devnet.solana.com';

  try {
    logger.info('Getting Solana balance', { address, rpcUrl: url });

    const connection = new Connection(url, 'confirmed');
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);

    logger.info('Solana balance retrieved', { address, balance });
    return balance.toString();
  } catch (error) {
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get Solana balance:', {
      error: errorMessage,
      address,
      rpcUrl: url,
      errorType: error?.constructor?.name,
    });

    // If it's a network error, suggest using devnet for testing
    if (errorMessage.includes('Load failed') || errorMessage.includes('CORS')) {
      throw new Error(
        `Network error getting Solana balance. This might be a CORS issue. Try using Solana devnet for testing: ${errorMessage}`,
      );
    }
    throw error;
  }
}

/**
 * Get Cosmos balance for specified denom
 */
async function getCosmosBalance(address: string, rpcUrl?: string, denom?: string): Promise<string> {
  try {
    logger.info('Getting Cosmos balance', { address, rpcUrl, denom });

    const url = rpcUrl || 'https://cosmos-rpc.publicnode.com';
    const client = await StargateClient.connect(url);
    const balances = await client.getAllBalances(address);

    const targetDenom = denom || 'uatom';
    const balance = balances.find(b => b.denom === targetDenom);

    logger.info('Cosmos balance retrieved', { address, balance });
    return balance?.amount || '0';
  } catch (error) {
    logger.error('Failed to get Cosmos balance:', error);
    throw error;
  }
}

/**
 * Get recent blockhash for Solana (needed for transaction building)
 */
export async function getSolanaRecentBlockhash(rpcUrl?: string): Promise<{
  blockhash: string;
  lastValidBlockHeight: number;
}> {
  try {
    // Use RPC URL provided by SDK, or fall back to devnet
    const url = rpcUrl || 'https://api.devnet.solana.com';
    const connection = new Connection(url, 'confirmed');
    const result = await connection.getLatestBlockhash();

    logger.info('Solana blockhash retrieved', result);
    return result;
  } catch (error) {
    logger.error('Failed to get Solana blockhash:', error);
    throw error;
  }
}
