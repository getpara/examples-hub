import { useThirdwebSmartAccount } from "@getpara/react-sdk";
import { SEPOLIA } from "@/lib/chain";
import { THIRDWEB_CLIENT_ID, THIRDWEB_CLIENT_ID_ERROR } from "@/lib/thirdweb";

interface UseSmartAccountOptions {
  enabled: boolean;
}

export function useSmartAccount({ enabled }: UseSmartAccountOptions) {
  const { smartAccount, isLoading, error } = useThirdwebSmartAccount({
    clientId: THIRDWEB_CLIENT_ID,
    chain: SEPOLIA.chain,
    sponsorGas: true,
    enabled: enabled && Boolean(THIRDWEB_CLIENT_ID),
  });

  return {
    smartAccount: smartAccount ?? null,
    address: smartAccount?.smartAccountAddress ?? null,
    isLoading,
    errorMessage: enabled && !THIRDWEB_CLIENT_ID ? THIRDWEB_CLIENT_ID_ERROR : (error?.message ?? null),
  };
}
