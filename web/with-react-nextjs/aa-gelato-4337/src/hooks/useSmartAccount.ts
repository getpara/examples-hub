import { useGelatoSmartAccount } from "@getpara/react-sdk";
import { SEPOLIA } from "@/lib/chain";
import { GELATO_API_KEY } from "@/lib/gelato";

interface UseSmartAccountOptions {
  enabled: boolean;
}

export function useSmartAccount({ enabled }: UseSmartAccountOptions) {
  const { smartAccount, isLoading, error } = useGelatoSmartAccount({
    apiKey: GELATO_API_KEY,
    chain: SEPOLIA.chain,
    enabled,
  });

  return {
    smartAccount: smartAccount ?? null,
    address: smartAccount?.smartAccountAddress ?? null,
    isLoading,
    errorMessage: error?.message ?? null,
  };
}
