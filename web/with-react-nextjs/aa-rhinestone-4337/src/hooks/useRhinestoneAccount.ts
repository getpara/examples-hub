import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@getpara/react-sdk";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { RhinestoneSDK, type RhinestoneAccount } from "@rhinestone/sdk";
import type { Account } from "viem";
import { getOrchestratorProxyUrl } from "@/lib/rhinestone";

interface UseRhinestoneAccountOptions {
  enabled: boolean;
}

export function useRhinestoneAccount({ enabled }: UseRhinestoneAccountOptions) {
  const { data: wallet } = useWallet();
  const { viemAccount, isLoading: isViemLoading } = useParaViemAccount();
  const [account, setAccount] = useState<RhinestoneAccount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rhinestone = useMemo(
    () =>
      new RhinestoneSDK({
        apiKey: "proxy",
        endpointUrl: getOrchestratorProxyUrl(),
      }),
    []
  );

  useEffect(() => {
    if (!enabled || !wallet?.address || !viemAccount || isViemLoading) {
      setAccount(null);
      setErrorMessage(null);
      return;
    }

    let isCurrent = true;

    async function createAccount(owner: Account) {
      setIsCreating(true);
      setErrorMessage(null);

      try {
        const created = await rhinestone.createAccount({
          owners: {
            type: "ecdsa",
            accounts: [owner],
          },
        });

        if (isCurrent) {
          setAccount(created);
        }
      } catch (error) {
        if (isCurrent) {
          setAccount(null);
          setErrorMessage(error instanceof Error ? error.message : "Rhinestone account setup failed.");
        }
      } finally {
        if (isCurrent) {
          setIsCreating(false);
        }
      }
    }

    void createAccount(viemAccount as Account);

    return () => {
      isCurrent = false;
    };
  }, [enabled, isViemLoading, rhinestone, viemAccount, wallet?.address]);

  return {
    account,
    address: account?.getAddress() ?? null,
    isLoading: isCreating || isViemLoading,
    errorMessage,
  };
}
