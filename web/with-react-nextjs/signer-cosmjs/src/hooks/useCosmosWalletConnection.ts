"use client";

import { useAccount, useModal } from "@getpara/react-sdk-lite";
import { useParaCosmjsProtoSigner } from "@getpara/react-sdk-lite/chains/cosmos";

export function useCosmosWalletConnection() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { protoSigner, isLoading } = useParaCosmjsProtoSigner();

  return {
    address: isConnected && protoSigner ? protoSigner.address : "",
    isConnected,
    isLoading,
    openModal,
  };
}
