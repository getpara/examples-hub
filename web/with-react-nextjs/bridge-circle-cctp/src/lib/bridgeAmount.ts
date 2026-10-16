import type { WalletBalances } from "@/lib/balances";
import { USDC, countFractionDigits, parseDecimal } from "@/lib/tokens";

export interface BridgeAmountCheck {
  amount: bigint | null;
  errorMessage: string | null;
}

function readAmount(input: string): BridgeAmountCheck {
  if (!input.trim()) {
    return { amount: null, errorMessage: null };
  }

  if (countFractionDigits(input) > USDC.decimals) {
    return { amount: null, errorMessage: `USDC supports up to ${USDC.decimals} decimal places.` };
  }

  const amount = parseDecimal(input, USDC.decimals);

  if (amount === null) {
    return { amount: null, errorMessage: "Enter a number, like 1 or 0.5." };
  }

  if (amount <= BigInt(0)) {
    return { amount: null, errorMessage: "Enter an amount greater than 0." };
  }

  return { amount, errorMessage: null };
}

export function checkBridgeAmount(input: string, balances: WalletBalances | null): BridgeAmountCheck {
  const check = readAmount(input);

  if (check.amount === null || !balances) {
    return check;
  }

  if (check.amount > balances.baseUsdc) {
    return { amount: check.amount, errorMessage: "This is more than your Base USDC balance." };
  }

  if (balances.baseEth === BigInt(0)) {
    return { amount: check.amount, errorMessage: "Add ETH on Base to pay gas for the approval and burn." };
  }

  return check;
}
