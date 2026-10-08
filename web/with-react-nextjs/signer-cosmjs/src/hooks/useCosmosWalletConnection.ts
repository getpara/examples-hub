import { useAccount, useModal } from "@getpara/react-sdk-lite";
import { useParaCosmjsProtoSigner } from "@getpara/react-sdk-lite/chains/cosmos";
import { useEffect, useState } from "react";
import type { AccountData } from "@cosmjs/amino";

export function useCosmosWalletConnection() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { protoSigner, isLoading } = useParaCosmjsProtoSigner();
  const [account, setAccount] = useState<{
    signer: typeof protoSigner;
    address: string;
    error: Error | null;
  } | null>(null);

  useEffect(() => {
    if (!isConnected || !protoSigner) {
      setAccount(null);
      return;
    }
    let active = true;
    protoSigner.getAccounts().then(
      (accounts: readonly AccountData[]) => {
        if (active) setAccount({ signer: protoSigner, address: accounts[0]?.address ?? "", error: null });
      },
      (error) => {
        if (active) setAccount({ signer: protoSigner, address: "", error: error instanceof Error ? error : new Error(String(error)) });
      },
    );
    return () => { active = false; };
  }, [isConnected, protoSigner]);

  const currentAccount = isConnected && account?.signer === protoSigner ? account : null;

  return {
    address: currentAccount?.address ?? "",
    error: currentAccount?.error ?? null,
    protoSigner,
    isConnected,
    isLoading: isLoading || (isConnected && !!protoSigner && !currentAccount),
    openModal,
  };
}
