import { useCallback, useState } from "react";
import { usePortoSmartAccount } from "@getpara/react-sdk";
import type { Address } from "viem";
import { BASE_SEPOLIA } from "@/lib/chain";

export function usePortoUpgrade(address: Address | null) {
  const [requestedAddress, setRequestedAddress] = useState<Address | null>(null);
  const isRequested = address !== null && requestedAddress === address;
  const { smartAccount, isFetching, error, refetch } = usePortoSmartAccount({
    chain: BASE_SEPOLIA.chain,
    enabled: isRequested,
  });

  const upgrade = useCallback(() => {
    if (isRequested) {
      void refetch();
      return;
    }

    setRequestedAddress(address);
  }, [address, isRequested, refetch]);

  return {
    upgrade,
    isUpgraded: isRequested && Boolean(smartAccount),
    errorMessage: isRequested ? (error?.message ?? null) : null,
    isPending: isRequested && isFetching,
  };
}
