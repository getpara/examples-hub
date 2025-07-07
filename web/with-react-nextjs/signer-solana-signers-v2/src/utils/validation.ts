import { Address } from "@solana/addresses";
import { SOLANA_ADDRESS_LENGTH, MIN_SOL_AMOUNT } from "@/config/constants";

/**
 * Validates a Solana address
 * @param address - The address to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validateSolanaAddress(address: string): {
  isValid: boolean;
  error?: string;
} {
  if (!address) {
    return { isValid: false, error: "Address is required" };
  }

  if (address.length < 32 || address.length > SOLANA_ADDRESS_LENGTH) {
    return { isValid: false, error: "Invalid address length" };
  }

  // Check if it's a valid base58 string
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!base58Regex.test(address)) {
    return { isValid: false, error: "Invalid address format" };
  }

  try {
    // Try to cast to Address type - this will validate the format
    const _validAddress = address as Address;
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid Solana address" };
  }
}

/**
 * Validates a SOL amount
 * @param amount - The amount to validate as a string
 * @returns An object with isValid boolean and optional error message
 */
export function validateSolAmount(amount: string): {
  isValid: boolean;
  error?: string;
} {
  if (!amount) {
    return { isValid: false, error: "Amount is required" };
  }

  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: "Invalid amount format" };
  }

  if (numAmount < MIN_SOL_AMOUNT) {
    return { isValid: false, error: `Amount must be at least ${MIN_SOL_AMOUNT} SOL` };
  }

  // Check for too many decimal places (max 9 for SOL)
  const decimalPlaces = amount.includes('.') ? amount.split('.')[1].length : 0;
  if (decimalPlaces > 9) {
    return { isValid: false, error: "Maximum 9 decimal places allowed" };
  }

  return { isValid: true };
}

/**
 * Formats a lamport amount to SOL
 * @param lamports - Amount in lamports
 * @param decimals - Number of decimal places to show
 * @returns Formatted SOL amount as string
 */
export function formatLamportsToSol(lamports: bigint | number, decimals: number = 4): string {
  const sol = Number(lamports) / 1e9;
  return sol.toFixed(decimals);
}

/**
 * Converts SOL to lamports
 * @param sol - Amount in SOL
 * @returns Amount in lamports as bigint
 */
export function solToLamports(sol: number | string): bigint {
  const solNum = typeof sol === 'string' ? parseFloat(sol) : sol;
  return BigInt(Math.floor(solNum * 1e9));
}