import { WalletType } from '@getpara/react-native-wallet';

// Validation functions
export function validateAmount(
  amount: string,
  availableBalance: number,
  tokenTicker: string,
  networkType: WalletType
): string {
  if (!amount) {
    return '';
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return 'Please enter a valid number';
  }

  if (numAmount <= 0) {
    return 'Amount must be greater than zero';
  }

  const minAmount = getMinAmount(networkType);
  if (numAmount < minAmount) {
    return `Amount must be at least ${minAmount} ${tokenTicker}`;
  }

  if (numAmount > availableBalance) {
    return `Exceeds available balance of ${availableBalance} ${tokenTicker}`;
  }

  return '';
}

// Network-specific configurations
export function getMinAmount(networkType: WalletType): number {
  return networkType === WalletType.EVM ? 0.000001 : 0.00001;
}

export function getDecimalPrecision(networkType: WalletType): number {
  return networkType === WalletType.EVM ? 6 : 4;
}

// Conversion functions
export function convertUsdToCrypto(
  usdAmount: number,
  usdPrice: number,
  networkType: WalletType
): string {
  if (!usdPrice || usdPrice <= 0) return '0';
  const precision = getDecimalPrecision(networkType);
  return (usdAmount / usdPrice).toFixed(precision);
}

export function convertCryptoToUsd(
  cryptoAmount: number,
  usdPrice: number
): string {
  if (!usdPrice || usdPrice <= 0) return '0.00';
  return (cryptoAmount * usdPrice).toFixed(2);
}

// Format conversion result for display
export function formatConversionDisplay(
  value: string,
  isUsdMode: boolean,
  usdPrice: number | null,
  tokenTicker: string,
  networkType: WalletType
): string {
  if (!usdPrice || usdPrice <= 0 || !value) return '';

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';

  if (isUsdMode) {
    const cryptoValue = convertUsdToCrypto(numValue, usdPrice, networkType);
    return `≈ ${cryptoValue} ${tokenTicker}`;
  } else {
    const usdValue = convertCryptoToUsd(numValue, usdPrice);
    return `≈ $${usdValue}`;
  }
}
