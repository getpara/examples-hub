import { WalletType } from "@getpara/react-native-wallet";
import { SupportedWalletType } from "@/types";
import { isValidEvmAddress, isValidSolanaAddress } from "@/utils/transactionUtils";

// Validate address based on network type
export function validateRecipientAddress(
  address: string,
  networkType: SupportedWalletType
): { isValid: boolean; errorMessage: string } {
  if (!address.trim()) {
    return { isValid: false, errorMessage: "" };
  }

  let isValid = false;

  if (networkType === WalletType.EVM) {
    isValid = isValidEvmAddress(address);
  } else if (networkType === WalletType.SOLANA) {
    isValid = isValidSolanaAddress(address);
  }

  const errorMessage = !isValid && address
    ? `Invalid ${networkType === WalletType.EVM ? "Ethereum" : "Solana"} address format`
    : "";

  return { isValid, errorMessage };
}

// Get network-specific placeholder
export function getNetworkPlaceholder(networkType: SupportedWalletType): string {
  return networkType === WalletType.EVM ? "0x..." : "Solana address...";
}

// Get network display name
export function getNetworkDisplayName(networkType: SupportedWalletType): string {
  return networkType === WalletType.EVM ? "Ethereum" : "Solana";
}