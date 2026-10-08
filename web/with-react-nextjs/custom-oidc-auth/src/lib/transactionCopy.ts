import { SEPOLIA } from "@/lib/chain";
import { formatErrorMessage } from "@/lib/format";

export function transactionPendingMessage(hash: string | null, beforeHashMessage: string) {
  return hash ? `Waiting for ${SEPOLIA.name} to confirm the transaction.` : beforeHashMessage;
}

export function describeFaucetError(errorMessage: string | null, isRateLimited: boolean) {
  if (isRateLimited) {
    return "This wallet requested faucet funds recently. Try again later or sign in with a new wallet.";
  }

  return formatErrorMessage(errorMessage);
}

export function describeSendError(errorMessage: string | null, isPolicyDenied: boolean) {
  if (isPolicyDenied) {
    return { title: "Custom limit exceeded", message: "This send was denied by policy and was not signed." };
  }

  return { title: "Transaction failed", message: formatErrorMessage(errorMessage) };
}
