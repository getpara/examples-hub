"use client";

import { useMemo } from "react";
import { ethers } from "ethers";
import { SEPOLIA_RPC_URL } from "@/lib/para";

// A read-only JSON-RPC provider for Sepolia. The Para ethers signer uses it to fetch
// nonce / gas / balance and to broadcast the signed transaction.
export function useEthersProvider() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(SEPOLIA_RPC_URL), []);
  return { provider };
}
