"use client";

import { useStellarSigner } from "@getpara/react-sdk/stellar";
import { useAccount } from "@getpara/react-sdk";
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { TESTNET_HORIZON_URL } from "@/config/constants";

const server = new Horizon.Server(TESTNET_HORIZON_URL);

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { stellarSigner, isLoading } = useStellarSigner({ networkPassphrase: Networks.TESTNET });

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
