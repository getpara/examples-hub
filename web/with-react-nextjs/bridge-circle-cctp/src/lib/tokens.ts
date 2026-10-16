import { formatUnits, parseUnits } from "viem";

export const USDC = {
  symbol: "USDC",
  decimals: 6,
  baseAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  arcAddress: "0x3600000000000000000000000000000000000000",
} as const;

export const NATIVE_DECIMALS = 18;

const DECIMAL_PATTERN = /^(\d+\.?\d*|\.\d+)$/;

export function parseDecimal(value: string, decimals: number) {
  const trimmed = value.trim();

  if (!DECIMAL_PATTERN.test(trimmed)) {
    return null;
  }

  return parseUnits(trimmed, decimals);
}

export function countFractionDigits(value: string) {
  const [, fraction = ""] = value.trim().split(".");
  return fraction.length;
}

export function formatUsdc(amount: bigint) {
  return formatUnits(amount, USDC.decimals);
}

export function formatNative(amount: bigint) {
  return formatUnits(amount, NATIVE_DECIMALS);
}
