import { SOLANA_DEVNET } from "@/lib/chain";

export function transactionPendingMessage(signature: string | null) {
  return signature
    ? `Waiting for ${SOLANA_DEVNET.name} to confirm the transaction.`
    : "Approve the request in the Para window.";
}
