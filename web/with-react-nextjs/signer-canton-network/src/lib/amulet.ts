import { CANTON } from "@/lib/chain";

interface AmuletBalanceInput {
  hasParty: boolean;
  amount: string | null;
  errorMessage: string | null;
}

export function formatAmuletBalance({ hasParty, amount, errorMessage }: AmuletBalanceInput) {
  if (!hasParty) {
    return "No party yet";
  }

  if (errorMessage) {
    return "Unavailable";
  }

  if (amount === null) {
    return "Not fetched";
  }

  return `${Number(amount).toFixed(8)} ${CANTON.currencySymbol}`;
}
