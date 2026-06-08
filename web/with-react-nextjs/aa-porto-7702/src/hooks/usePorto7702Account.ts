"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { Account, Key, RelayActions } from "porto/viem";
import { createClient, http, type Hex } from "viem";
import { PORTO_CHAIN, PORTO_RELAY_URL } from "@/lib/porto";

interface UsePorto7702AccountOptions {
  enabled?: boolean;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Porto account upgrade failed.");
}

export function usePorto7702Account({ enabled = true }: UsePorto7702AccountOptions = {}) {
  const { viemAccount, isLoading: isViemLoading } = useParaViemAccount();
  const [portoAccount, setPortoAccount] = useState<RelayActions.upgradeAccount.ReturnType | null>(
    null
  );
  const [authorizedKeys, setAuthorizedKeys] = useState<readonly Key.Key[]>([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const portoClient = useMemo(
    () =>
      createClient({
        chain: PORTO_CHAIN,
        transport: http(PORTO_RELAY_URL),
      }),
    []
  );

  const signRawHash = useCallback(
    async (hash: Hex): Promise<Hex> => {
      if (!viemAccount?.sign) {
        throw new Error("Para Viem account is not ready.");
      }

      return viemAccount.sign({ hash });
    },
    [viemAccount]
  );

  useEffect(() => {
    async function refreshPortoStatus() {
      if (!enabled || !viemAccount?.address) {
        setPortoAccount(null);
        setAuthorizedKeys([]);
        return;
      }

      setIsCheckingStatus(true);

      try {
        const account = Account.from({ address: viemAccount.address });
        const keys = await RelayActions.getKeys(portoClient, { account });
        setAuthorizedKeys(keys);
        setPortoAccount(
          keys.length > 0
            ? Account.from({
                address: viemAccount.address,
                keys,
                async sign({ hash }) {
                  return signRawHash(hash as Hex);
                },
              })
            : null
        );
      } catch {
        setPortoAccount(null);
        setAuthorizedKeys([]);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    refreshPortoStatus();
  }, [enabled, viemAccount?.address, portoClient, signRawHash]);

  const upgradeToPorto = useCallback(async () => {
    if (!viemAccount?.address) {
      setError(new Error("Connect a Para EOA before upgrading."));
      return;
    }

    setIsUpgrading(true);
    setError(null);

    try {
      const account = Account.from({
        address: viemAccount.address,
        async sign({ hash }) {
          return signRawHash(hash as Hex);
        },
      });
      const adminKey = Key.createSecp256k1({ role: "admin" });
      const upgradedAccount = await RelayActions.upgradeAccount(portoClient, {
        account,
        authorizeKeys: [adminKey],
      });

      setPortoAccount(upgradedAccount);
      setAuthorizedKeys(upgradedAccount.keys ?? [adminKey]);
    } catch (upgradeError) {
      setError(toError(upgradeError));
    } finally {
      setIsUpgrading(false);
    }
  }, [portoClient, signRawHash, viemAccount?.address]);

  const adminKeyCount = authorizedKeys.filter((key) => key.role === "admin").length;
  const sessionKeyCount = authorizedKeys.filter((key) => key.role === "session").length;
  const isUpgraded = Boolean(portoAccount || authorizedKeys.length > 0);

  return {
    walletAddress: viemAccount?.address ?? null,
    portoAccountAddress: portoAccount?.address ?? null,
    isViemLoading,
    isCheckingStatus,
    isUpgrading,
    isUpgraded,
    canUpgrade: enabled && Boolean(viemAccount) && !isUpgraded && !isUpgrading && !isViemLoading,
    error,
    adminKeyCount,
    sessionKeyCount,
    upgradeToPorto,
  };
}
