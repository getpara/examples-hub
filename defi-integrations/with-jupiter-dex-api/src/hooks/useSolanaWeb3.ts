"use client";

import { useMemo } from "react";
import { Connection } from "@solana/web3.js";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { useClient } from "@getpara/react-sdk";
import { MAINNET_RPC_URL } from "@/config/constants";

export function useSolanaWeb3() {
  const client = useClient();

  const connection = useMemo(() => {
    return new Connection(MAINNET_RPC_URL, "confirmed");
  }, []);

  const signer = useMemo(() => {
    if (!client) return null;
    return new ParaSolanaWeb3Signer(client, connection);
  }, [client, connection]);

  return { connection, signer };
}