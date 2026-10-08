import { useAlchemySmartAccount } from "@getpara/react-sdk";
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from "@/lib/alchemy";
import { SEPOLIA } from "@/lib/chain";

interface UseSmartAccountOptions {
  enabled: boolean;
}

export function useSmartAccount({ enabled }: UseSmartAccountOptions) {
  const { smartAccount, isLoading, error } = useAlchemySmartAccount({
    apiKey: ALCHEMY_API_KEY,
    chain: SEPOLIA.chain,
    gasPolicyId: GAS_POLICY_ID,
    mode: "7702",
    enabled,
  });

  return {
    smartAccount: smartAccount ?? null,
    address: smartAccount?.smartAccountAddress ?? null,
    isLoading,
    errorMessage: error?.message ?? null,
  };
}
