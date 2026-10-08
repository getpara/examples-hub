import { useCallback, useState } from "react";
import type { GenerateWalletResponse, PregenWallet } from "@/lib/pregenWalletApi";

export function usePregenWallet() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState<PregenWallet | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const create = useCallback(async () => {
    setIsCreating(true);
    setErrorMessage(null);

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

      setWallet({
        email: data.email,
        customId: data.customId,
        walletId: data.wallet.id,
        walletAddress: data.wallet.address ?? "",
      });
      setEmail(data.email);
    } catch (error) {
      setWallet(null);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create pregen wallet");
    } finally {
      setIsCreating(false);
    }
  }, [email]);

  return {
    email,
    setEmail,
    wallet,
    isCreating,
    errorMessage,
    create,
  };
}
