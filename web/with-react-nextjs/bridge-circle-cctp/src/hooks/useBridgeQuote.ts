import { useQuery } from "@tanstack/react-query";
import type { BridgeAdapter } from "@/lib/bridgeAdapter";
import { estimateBridge, type MintSigner } from "@/lib/bridgeKit";
import { summarizeEstimate } from "@/lib/bridgeQuote";
import { formatUsdc } from "@/lib/tokens";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { summarizeErrorMessage } from "@/lib/errorSummary";

const QUOTE_DEBOUNCE_MS = 400;
const QUOTE_STALE_MS = 20_000;

interface BridgeQuoteInput {
  adapter: BridgeAdapter | null;
  amount: bigint | null;
  mintSigner: MintSigner | null;
}

export function useBridgeQuote({ adapter, amount, mintSigner }: BridgeQuoteInput) {
  const debouncedAmount = useDebouncedValue(amount, QUOTE_DEBOUNCE_MS);
  const amountText = debouncedAmount === null ? null : formatUsdc(debouncedAmount);
  const isEnabled = Boolean(adapter && amountText && mintSigner);

  const { data, isFetching, error } = useQuery({
    queryKey: ["bridge-quote", amountText, mintSigner],
    queryFn: async () => {
      if (!adapter || debouncedAmount === null || !amountText || !mintSigner) {
        throw new Error("Enter an amount to get a quote.");
      }

      const estimate = await estimateBridge(adapter, amountText, mintSigner);
      return summarizeEstimate(estimate, debouncedAmount, mintSigner);
    },
    enabled: isEnabled,
    staleTime: QUOTE_STALE_MS,
    retry: 1,
  });

  const isSettling = amount !== debouncedAmount;

  return {
    quote: isEnabled && !isSettling ? (data ?? null) : null,
    isLoading: amount !== null && (isSettling || isFetching),
    errorMessage: isEnabled && !isSettling ? summarizeErrorMessage(error?.message) : null,
  };
}
