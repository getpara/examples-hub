"use client";

import { useCallback, useMemo, useState } from "react";
import { useAccount, useExportPrivateKey, useModal, useWallet } from "@getpara/react-sdk-lite";
import type { GenerateWalletResponse } from "@/lib/para/types";

export type PregenWalletDraft = {
  email: string;
  customId: string;
  walletId: string;
  walletAddress: string;
};

export function usePregenClaimFlow() {
  const { isConnected, isLoading } = useAccount();
  const { data: wallet } = useWallet();
  const { openModal } = useModal();
  const {
    exportPrivateKeyAsync,
    isPending: isExportingPrivateKey,
  } = useExportPrivateKey();
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState<PregenWalletDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const connectedAddress = wallet?.address ?? "";
  const isClaimedWallet = useMemo(() => {
    if (!draft?.walletAddress || !connectedAddress) {
      return false;
    }

    return draft.walletAddress.toLowerCase() === connectedAddress.toLowerCase();
  }, [connectedAddress, draft?.walletAddress]);

  const generateWallet = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setExportError(null);
    setExportStatus(null);

    try {
      const response = await fetch("/api/wallet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: GenerateWalletResponse = await response.json();

      if (!response.ok || !data.success || !data.email || !data.customId || !data.wallet?.id) {
        throw new Error(data.error ?? "Failed to create pregen wallet");
      }

      setDraft({
        email: data.email,
        customId: data.customId,
        walletId: data.wallet.id,
        walletAddress: data.wallet.address ?? "",
      });
      setEmail(data.email);
    } catch (caughtError) {
      setDraft(null);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to create pregen wallet");
    } finally {
      setIsGenerating(false);
    }
  }, [email]);

  const beginClaim = useCallback(() => {
    setError(null);
    setExportError(null);
    openModal();
  }, [openModal]);

  const exportClaimedWalletPrivateKey = useCallback(async () => {
    if (!draft?.walletId || !isClaimedWallet) {
      return;
    }

    setExportError(null);
    setExportStatus(null);

    try {
      await exportPrivateKeyAsync({ walletId: draft.walletId });
      setExportStatus("Export flow opened.");
    } catch (caughtError) {
      setExportError(caughtError instanceof Error ? caughtError.message : "Failed to open private key export");
    }
  }, [draft?.walletId, exportPrivateKeyAsync, isClaimedWallet]);

  return {
    email,
    setEmail,
    draft,
    error,
    isGenerating,
    isConnected,
    isLoading,
    connectedAddress,
    isClaimedWallet,
    exportError,
    exportStatus,
    isExportingPrivateKey,
    generateWallet,
    beginClaim,
    exportClaimedWalletPrivateKey,
  };
}
