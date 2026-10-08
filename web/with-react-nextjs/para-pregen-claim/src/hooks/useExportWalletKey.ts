import { useCallback, useState } from "react";
import { useExportPrivateKey } from "@getpara/react-sdk-lite";

export function useExportWalletKey() {
  const { exportPrivateKeyAsync, isPending } = useExportPrivateKey();
  const [isOpened, setIsOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const exportKey = useCallback(
    async (walletId: string) => {
      setIsOpened(false);
      setErrorMessage(null);

      try {
        await exportPrivateKeyAsync({ walletId });
        setIsOpened(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to open private key export");
      }
    },
    [exportPrivateKeyAsync]
  );

  return {
    exportKey,
    isPending,
    isOpened,
    errorMessage,
  };
}
