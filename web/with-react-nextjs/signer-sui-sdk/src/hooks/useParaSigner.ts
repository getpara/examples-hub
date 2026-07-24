"use client";

import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSuiSigner } from "@getpara/react-sdk-lite/chains/sui";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { SUI_NETWORK, SUI_RPC_URL } from "@/config/constants";

// A single shared client for reads (balance) and transaction execution. SuiGrpcClient is the
// non-deprecated client; @mysten/sui's JSON-RPC client is deprecated and its public testnet fullnode
// is being retired, while gRPC on the same host is live.
const client = new SuiGrpcClient({ network: SUI_NETWORK, baseUrl: SUI_RPC_URL });

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { suiSigner, isLoading } = useParaSuiSigner();

  const isReady = Boolean(suiSigner && isConnected && !isLoading);
  const address = suiSigner?.address ?? null;

  return {
    signer: suiSigner,
    client,
    isReady,
    isLoading,
    address,
  };
}
