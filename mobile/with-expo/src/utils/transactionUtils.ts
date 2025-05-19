import { WalletType } from "@getpara/react-native-wallet";
import { ethers } from "ethers";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SupportedWalletType } from "@/types";

export const isValidEvmAddress = (addr: string): boolean => ethers.isAddress(addr);

export const isValidSolanaAddress = (addr: string): boolean => {
  try {
    void new PublicKey(addr);
    return true;
  } catch {
    return false;
  }
};

export function isValidAddress(address: string, networkType: SupportedWalletType): boolean {
  if (!address.trim()) return false;
  return networkType === WalletType.EVM
    ? isValidEvmAddress(address)
    : networkType === WalletType.SOLANA
    ? isValidSolanaAddress(address)
    : false;
}

export function calculateEvmTransactionFee(gasLimit: string | bigint, gasPrice: string | bigint): string {
  try {
    return ethers.formatEther(BigInt(gasLimit) * BigInt(gasPrice));
  } catch {
    return "0";
  }
}

export function calculateEvm1559Fee(gasUsed: bigint, baseFeePerGas: bigint, maxPriorityFeePerGas: bigint): string {
  return ethers.formatEther(gasUsed * (baseFeePerGas + maxPriorityFeePerGas));
}

export function estimateSolanaTransactionFee(lamportsPerSignature = 5_000): string {
  return (lamportsPerSignature / LAMPORTS_PER_SOL).toString();
}

export function getNetworkName(networkType: SupportedWalletType): string {
  switch (networkType) {
    case WalletType.EVM:
      return "Ethereum";
    case WalletType.SOLANA:
      return "Solana";
    default:
      return "Unknown Network";
  }
}

export function getExplorerUrl(networkType: SupportedWalletType, txHash: string, networkId?: string | number): string {
  if (networkType === WalletType.EVM) {
    const baseUrl =
      networkId === "1" || networkId === 1
        ? "https://etherscan.io"
        : networkId === "5" || networkId === 5
        ? "https://goerli.etherscan.io"
        : networkId === "11155111" || networkId === 11155111
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";

    return `${baseUrl}/tx/${txHash}`;
  }

  if (networkType === WalletType.SOLANA) {
    const cluster = networkId || "mainnet-beta";
    return `https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`;
  }

  return "";
}
