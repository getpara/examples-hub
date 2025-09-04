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
      return getEVMBalance(address, options?.rpcUrl, options?.token);

    case 'SOLANA':
      return getSolanaBalance(address, options?.rpcUrl);

    case 'COSMOS':
      return getCosmosBalance(address, options?.rpcUrl, options?.denom);

    default:
      throw new Error(`Unsupported wallet type for balance: ${walletType}`);
  }
}

/**
 * Get EVM balance in wei (for ETH) or smallest unit (for tokens)
 */
async function getEVMBalance(address: string, rpcUrl?: string, tokenAddress?: string): Promise<string> {
  try {
    const url = rpcUrl || 'https://eth.llamarpc.com';
    const provider = new ethers.JsonRpcProvider(url);
    if (!tokenAddress) {
      const balance = await provider.getBalance(address);
      return balance.toString();
    }

    const erc20Abi = ['function balanceOf(address owner) view returns (uint256)'];

    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const balance = await tokenContract.balanceOf(address);
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
  const url = rpcUrl || 'https://api.devnet.solana.com';

  try {
    const connection = new Connection(url, 'confirmed');
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);

    return balance.toString();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get Solana balance:', {
      error: errorMessage,
      address,
      rpcUrl: url,
      errorType: error?.constructor?.name,
    });

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
    const url = rpcUrl || 'https://cosmos-rpc.publicnode.com';
    const client = await StargateClient.connect(url);
    const balances = await client.getAllBalances(address);

    const targetDenom = denom || 'uatom';
    const balance = balances.find(b => b.denom === targetDenom);

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
    const url = rpcUrl || 'https://api.devnet.solana.com';
    const connection = new Connection(url, 'confirmed');
    const result = await connection.getLatestBlockhash();

    return result;
  } catch (error) {
    logger.error('Failed to get Solana blockhash:', error);
    throw error;
  }
}
