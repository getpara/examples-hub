import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

export const SIGN_PENDING_MESSAGE = "Approve the request in the Para window.";

export const BROADCAST_PENDING_MESSAGE = `Waiting for the ${ICS_PROVIDER_TESTNET.chainId} chain to include the transaction.`;

const COMMISSION_RATE_TO_PERCENT = 1e16;

export function formatValidatorOption(moniker: string, commissionRate: string) {
  const percent = (Number(commissionRate) / COMMISSION_RATE_TO_PERCENT).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return `${moniker} (${percent}% commission)`;
}
