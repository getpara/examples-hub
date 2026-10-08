import { useZeroDevSmartAccount } from "@getpara/react-sdk";
import { SEPOLIA } from "@/lib/chain";
import { ZERODEV_PROJECT_ID } from "@/lib/zerodev";

interface UseSmartAccountOptions {
  enabled: boolean;
}

export function useSmartAccount({ enabled }: UseSmartAccountOptions) {
  const { smartAccount, isLoading, error } = useZeroDevSmartAccount({
    projectId: ZERODEV_PROJECT_ID,
    chain: SEPOLIA.chain,
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
