import { useCallback, useEffect, useState } from "react";
import type ParaWeb from "@getpara/web-sdk";

interface EvmWallet {
  id: string;
  address: `0x${string}`;
}

function getEvmWallet(para: ParaWeb): EvmWallet | null {
  const wallet = para.getWalletsByType("EVM")[0];
  return wallet?.address?.startsWith("0x") ? { id: wallet.id, address: wallet.address as `0x${string}` } : null;
}

export function useParaSession(para: ParaWeb | null, isReady: boolean) {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<EvmWallet | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!para?.isReady) return;

    const connected = await para.isFullyLoggedIn();
    setIsConnected(connected);
    setWallet(connected ? getEvmWallet(para) : null);
  }, [para]);

  useEffect(() => {
    if (!para || !isReady) return;

    const unsubscribe = para.onStatePhaseChange(() => {
      void refresh();
    });
    void refresh();

    return unsubscribe;
  }, [isReady, para, refresh]);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    setErrorMessage(null);

    try {
      if (!para) {
        throw new Error("Wallet client is not ready yet.");
      }

      await para.logout();
      setIsConnected(false);
      setWallet(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not disconnect.");
    } finally {
      setIsDisconnecting(false);
    }
  }, [para]);

  return {
    isConnected,
    walletId: wallet?.id ?? null,
    address: wallet?.address ?? null,
    isDisconnecting,
    errorMessage,
    refresh,
    disconnect,
  };
}
