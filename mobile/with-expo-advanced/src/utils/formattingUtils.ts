import { formatUnits } from 'ethers';
import { WalletType } from '@getpara/react-native-wallet';
import { SupportedWalletType } from '@/types';

export function formatUsdValue(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTokenAmount(
  amount: string | bigint,
  decimals: number,
  maxFractionDigits = 6
): string {
  try {
    const raw = formatUnits(amount.toString(), decimals);
    const nf = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: maxFractionDigits,
    });
    return nf.format(Number(raw));
  } catch {
    return '0';
  }
}

export const formatLamports = (amt: string | bigint) =>
  formatTokenAmount(amt, 9);

export function formatCryptoValue(
  value: number,
  ticker: string,
  fractionDigits = 6
): string {
  return `${value.toFixed(fractionDigits)} ${ticker}`;
}

export function truncateAddress(
  address?: string,
  leading = 8,
  trailing = 6
): string {
  if (!address) return '';
  return `${address.slice(0, leading)}…${address.slice(-trailing)}`;
}

export function formatAddress(
  address: string,
  networkType: SupportedWalletType
): string {
  if (!address || address.length < 10) return address;

  return networkType === WalletType.EVM
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export const prettifyAmount = (raw: string, decimals: number) =>
  formatTokenAmount(raw, decimals);
