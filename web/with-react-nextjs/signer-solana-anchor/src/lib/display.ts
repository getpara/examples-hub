import { SOLANA_DEVNET } from "@/lib/chain";

export const TRANSACTION_PENDING_MESSAGE = `Approve the request in the Para window, then wait for ${SOLANA_DEVNET.name} to confirm the transaction.`;

export function formatTokenReading(amount: string | null, isLoading: boolean) {
  if (isLoading) {
    return "Loading";
  }
  return amount ?? "Unavailable";
}

export function mintCreatedMessage(mintAddress: string) {
  return `Mint account ${mintAddress}. Mint tokens to it from Mint token.`;
}
