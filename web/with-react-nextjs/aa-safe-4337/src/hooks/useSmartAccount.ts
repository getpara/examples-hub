import { useSafeSmartAccount } from "@getpara/react-sdk";
import { SEPOLIA } from "@/lib/chain";
import { PIMLICO_API_KEY } from "@/lib/pimlico";

interface UseSmartAccountOptions {
  enabled: boolean;
}

export function useSmartAccount({ enabled }: UseSmartAccountOptions) {
  const { smartAccount, isLoading, error } = useSafeSmartAccount({
    pimlicoApiKey: PIMLICO_API_KEY,
    chain: SEPOLIA.chain,
    rpcUrl: SEPOLIA.rpcUrl,
    enabled: enabled && Boolean(PIMLICO_API_KEY),
  });

  const missingApiKeyMessage = enabled && !PIMLICO_API_KEY ? "NEXT_PUBLIC_PIMLICO_API_KEY is required." : null;

  return {
    smartAccount: smartAccount ?? null,
    address: smartAccount?.smartAccountAddress ?? null,
    isLoading,
    errorMessage: missingApiKeyMessage ?? error?.message ?? null,
  };
}
