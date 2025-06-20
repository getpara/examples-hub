/**
 * Balance fetching API utilities
 * Extracted from useBalances hook for better testability and reusability
 */

import { Wallet, WalletType } from '@getpara/react-native-wallet';
import { Connection, PublicKey } from '@solana/web3.js';
import { JsonRpcProvider } from 'ethers';
import { NATIVE_TOKEN_PLACEHOLDER } from '@/constants/networks';
import { handleQueryError } from '@/utils/queryUtils';

export interface BalanceData {
  balance: string;
  decimals: number;
  walletType: WalletType;
  symbol: string;
  tokenAddress?: string;
}

/**
 * Fetch EVM wallet balance
 */
export async function fetchEvmWalletBalance(
  wallet: Wallet,
  provider: JsonRpcProvider
): Promise<BalanceData[]> {
  if (!wallet.address) {
    throw new Error('Wallet address is undefined');
  }

  try {
    const balance = await provider.getBalance(wallet.address);
    // For EVM networks, we'll use ETH as default
    const symbol = 'ETH';
    const decimals = 18;

    return [
      {
        balance: balance.toString(), // Keep as raw amount string
        decimals: decimals,
        walletType: wallet.type || WalletType.EVM,
        symbol: symbol,
        tokenAddress: NATIVE_TOKEN_PLACEHOLDER,
      },
    ];
  } catch (error) {
    throw handleQueryError(error);
  }
}

/**
 * Fetch Solana wallet balance
 */
export async function fetchSolanaWalletBalance(
  wallet: Wallet,
  connection: Connection
): Promise<BalanceData[]> {
  if (!wallet.address) {
    throw new Error('Wallet address is undefined');
  }

  try {
    const publicKey = new PublicKey(wallet.address);
    const balance = await connection.getBalance(publicKey);
    const symbol = 'SOL';
    const decimals = 9;

    return [
      {
        balance: balance.toString(), // Keep as raw lamports
        decimals: decimals,
        walletType: WalletType.SOLANA,
        symbol: symbol,
        tokenAddress: NATIVE_TOKEN_PLACEHOLDER,
      },
    ];
  } catch (error) {
    throw handleQueryError(error);
  }
}

/**
 * Fetch balances for multiple wallets
 */
interface SignerWithProvider {
  provider: JsonRpcProvider;
}

interface SignerWithConnection {
  connection: Connection;
}

export async function fetchWalletsBalances(
  wallets: Wallet[],
  signers: Record<string, SignerWithProvider | SignerWithConnection>
): Promise<Record<string, BalanceData[]>> {
  const balancePromises = wallets.map(async (wallet) => {
    const signer = signers[wallet.id];
    if (!signer) {
      return { walletId: wallet.id, balances: [] };
    }

    try {
      let balances: BalanceData[];

      if (wallet.type === WalletType.SOLANA) {
        balances = await fetchSolanaWalletBalance(
          wallet,
          (signer as SignerWithConnection).connection
        );
      } else {
        balances = await fetchEvmWalletBalance(
          wallet,
          (signer as SignerWithProvider).provider
        );
      }

      return { walletId: wallet.id, balances };
    } catch (error) {
      console.error(`Failed to fetch balance for wallet ${wallet.id}:`, error);
      // Return empty balances on error instead of throwing
      return { walletId: wallet.id, balances: [] };
    }
  });

  const results = await Promise.all(balancePromises);

  // Convert array to record
  return results.reduce(
    (acc, { walletId, balances }) => {
      acc[walletId] = balances;
      return acc;
    },
    {} as Record<string, BalanceData[]>
  );
}

/**
 * Normalize balance value to ensure it's always a valid string
 */
export function normalizeBalance(balance: string | undefined | null): string {
  if (!balance || balance === '' || balance === 'NaN') {
    return '0';
  }
  return balance;
}
