"use client";

import { useAccount } from "@getpara/react-sdk-lite";
import { useParaStellarSigner } from "@getpara/react-sdk-lite/chains/stellar";
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { TESTNET_HORIZON_URL } from "@/config/constants";

const server = new Horizon.Server(TESTNET_HORIZON_URL);

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { stellarSigner, isLoading } = useParaStellarSigner({ networkPassphrase: Networks.TESTNET });

  const isReady = Boolean(stellarSigner && isConnected && !isLoading);
  const address = stellarSigner?.address ?? null;

  return {
    signer: stellarSigner,
    server,
    isReady,
    isLoading,
    address,
  };
}
