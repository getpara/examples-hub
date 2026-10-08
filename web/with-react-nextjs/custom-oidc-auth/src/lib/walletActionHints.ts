import { SEND_MIN_BALANCE_WEI } from "@/lib/transfer";

const CHECKING_BALANCE = "Checking the Sepolia balance.";

interface FaucetHintInput {
  isBalanceLoading: boolean;
  balanceWei: bigint | null;
}

interface SendHintInput extends FaucetHintInput {
  isSignerReady: boolean;
}

export function getFaucetHint({ isBalanceLoading, balanceWei }: FaucetHintInput) {
  if (isBalanceLoading) {
    return CHECKING_BALANCE;
  }

  if (balanceWei !== null && balanceWei > BigInt(0)) {
    return "Wallet already has Sepolia ETH.";
  }

  return null;
}

export function getSendHint({ isBalanceLoading, balanceWei, isSignerReady }: SendHintInput) {
  if (isBalanceLoading) {
    return CHECKING_BALANCE;
  }

  if (!isSignerReady) {
    return "Preparing your Para wallet signer.";
  }

  if (balanceWei === null || balanceWei < SEND_MIN_BALANCE_WEI) {
    return "Request enough Sepolia testnet ETH before sending.";
  }

  return null;
}
