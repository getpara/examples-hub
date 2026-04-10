"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { useAccount } from "@getpara/react-sdk";
import { Chains } from "porto";
import { Account, Key, RelayActions } from "porto/viem";
import { createClient, http, type Hex } from "viem";

export function usePortoAccount() {
  const { viemAccount, isLoading: isViemLoading } = useParaViemAccount();
  const { isConnected } = useAccount();

  const [portoAccount, setPortoAccount] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portoClient = useMemo(
    () =>
      createClient({
        chain: Chains.baseSepolia,
        transport: http("https://rpc.porto.sh"),
      }),
    []
  );

  const signRawHash = useCallback(
    async (hash: Hex): Promise<Hex> => {
      if (!viemAccount?.sign) {
        throw new Error("Viem account not available");
      }
      return viemAccount.sign({ hash });
    },
    [viemAccount]
  );

  useEffect(() => {
    async function checkPortoStatus() {
      if (!viemAccount?.address || !isConnected) return;

      setIsCheckingStatus(true);
      try {
        const tempAccount = Account.from({ address: viemAccount.address });
        const keys = await RelayActions.getKeys(portoClient, {
          account: tempAccount,
        });

        if (keys.length > 0) {
          const account = Account.from({
            address: viemAccount.address,
            keys: [...keys],
            async sign({ hash }) {
              return signRawHash(hash as Hex);
            },
          });
          setPortoAccount(account);
        }
      } catch {
        // Account not upgraded yet
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkPortoStatus();
  }, [viemAccount?.address, isConnected, portoClient, signRawHash]);

  const upgradeToPorto = useCallback(async () => {
    if (!viemAccount || !isConnected) {
      setError("Wallet not connected");
      return;
    }

    setIsUpgrading(true);
    setError(null);

    try {
      const customAccount = Account.from({
        address: viemAccount.address,
        async sign({ hash }) {
          return signRawHash(hash as Hex);
        },
      });

      const adminKey = Key.createSecp256k1({ role: "admin" });

      const prepared = await RelayActions.prepareUpgradeAccount(portoClient, {
        address: customAccount.address,
        authorizeKeys: [adminKey],
      });

      const signatures = {
        auth: await signRawHash(prepared.digests.auth as Hex),
        exec: await signRawHash(prepared.digests.exec as Hex),
      };

      const upgradedAccount = await RelayActions.upgradeAccount(portoClient, {
        ...prepared,
        signatures,
      });

      setPortoAccount(upgradedAccount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setIsUpgrading(false);
    }
  }, [viemAccount, isConnected, portoClient, signRawHash]);

  return {
    viemAccount,
    portoAccount,
    isViemLoading,
    isUpgrading,
    isCheckingStatus,
    error,
    upgradeToPorto,
    isConnected,
  };
}
