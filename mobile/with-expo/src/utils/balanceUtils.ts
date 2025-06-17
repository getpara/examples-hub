import { Provider, toBigInt } from 'ethers';
import { PublicKey, Connection } from '@solana/web3.js';

interface WalletInfo {
  id: string;
  address: string | null;
}

interface BalanceFetchResult {
  walletId: string;
  balance: {
    amount: string;
    symbol: string;
    decimals: number;
  } | null;
  error?: Error;
}

/**
 * Fetches the balance for a single EVM wallet
 */
export async function fetchEvmWalletBalance(
  wallet: WalletInfo,
  provider: Provider,
  symbol: string = 'ETH',
  decimals: number = 18
): Promise<BalanceFetchResult> {
  if (!wallet.address) {
    return {
      walletId: wallet.id,
      balance: null,
      error: new Error('No wallet address provided'),
    };
  }

  try {
    const balance = await provider.getBalance(wallet.address);
    return {
      walletId: wallet.id,
      balance: {
        amount: balance.toString(),
        symbol,
        decimals,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error fetching ${symbol} balance for ${wallet.address}:`,
      errorMessage
    );

    return {
      walletId: wallet.id,
      balance: {
        amount: '0',
        symbol,
        decimals,
      },
      error: new Error(`Failed to fetch balance: ${errorMessage}`),
    };
  }
}

/**
 * Fetches the balance for a single Solana wallet
 */
export async function fetchSolanaWalletBalance(
  wallet: WalletInfo,
  connection: Connection,
  symbol: string = 'SOL',
  decimals: number = 9
): Promise<BalanceFetchResult> {
  if (!wallet.address) {
    return {
      walletId: wallet.id,
      balance: null,
      error: new Error('No wallet address provided'),
    };
  }

  try {
    const publicKey = new PublicKey(wallet.address);
    const balance = await connection.getBalance(publicKey);
    return {
      walletId: wallet.id,
      balance: {
        amount: balance.toString(),
        symbol,
        decimals,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error fetching ${symbol} balance for ${wallet.address}:`,
      errorMessage
    );

    return {
      walletId: wallet.id,
      balance: {
        amount: '0',
        symbol,
        decimals,
      },
      error: new Error(`Failed to fetch balance: ${errorMessage}`),
    };
  }
}

/**
 * Calculates the total balance for EVM wallets
 */
export function calculateTotalEvmBalance(
  balances: Record<string, { amount: string }>
): string {
  let total = toBigInt(0);

  for (const walletId in balances) {
    try {
      total += toBigInt(balances[walletId].amount);
    } catch (error) {
      console.error(`Error adding balance for wallet ${walletId}:`, error);
    }
  }

  return total.toString();
}

/**
 * Calculates the total balance for Solana wallets
 */
export function calculateTotalSolanaBalance(
  balances: Record<string, { amount: string }>
): string {
  let total = BigInt(0);

  for (const walletId in balances) {
    try {
      total += BigInt(balances[walletId].amount);
    } catch (error) {
      console.error(`Error adding balance for wallet ${walletId}:`, error);
    }
  }

  return total.toString();
}
