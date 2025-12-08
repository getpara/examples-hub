"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { useClient, useWallet } from "@getpara/react-sdk";
import { useAccount } from "@getpara/react-sdk";
import { Chains } from "porto";
import { Account, Key, RelayActions } from "porto/viem";
import { createClient, http, parseSignature, serializeSignature, type Hex } from "viem";

function hexToBase64(hex: string): string {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  return btoa(String.fromCharCode(...bytes));
}

function normalizeSignature(signature: Hex): Hex {
  const parsed = parseSignature(signature);
  return serializeSignature({
    r: parsed.r,
    s: parsed.s,
    yParity: parsed.yParity,
  });
}

export function usePortoAccount() {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();
  const { isConnected } = useAccount();
  const para = useClient();
  const { data: wallet } = useWallet();

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
      if (!para || !wallet?.id) {
        throw new Error("Para client or wallet not available");
      }

      const hashBase64 = hexToBase64(hash);
      const res = await para.signMessage({
        walletId: wallet.id,
        messageBase64: hashBase64,
      });

      const signature = (res as { signature: string }).signature;
      return normalizeSignature(`0x${signature}` as Hex);
    },
    [para, wallet]
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
    if (!viemAccount || !isConnected || !para || !wallet?.id) {
      setError("Para client or wallet not available");
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
  }, [viemAccount, isConnected, para, wallet, portoClient, signRawHash]);

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
