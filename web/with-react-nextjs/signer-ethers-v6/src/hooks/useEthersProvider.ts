"use client";

import { useMemo } from "react";
import { ethers } from "ethers";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

export function useEthersProvider() {
  const provider = useMemo(() => {
    return new ethers.JsonRpcProvider(HOLESKY_RPC_URL);
  }, []);

  return {
    provider,
  };
}