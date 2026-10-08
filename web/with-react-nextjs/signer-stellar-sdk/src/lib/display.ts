import { STELLAR_TESTNET } from "@/lib/chain";

export function formatXlmBalance(balance: string | null) {
  return balance === null ? undefined : `${balance} ${STELLAR_TESTNET.currencySymbol}`;
}
