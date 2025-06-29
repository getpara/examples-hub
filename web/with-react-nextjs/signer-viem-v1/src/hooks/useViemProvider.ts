"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http, PublicClient } from "viem";
import { holesky } from "viem/chains";
import { HOLESKY_RPC_URL } from "@/config/constants";

export function useViemProvider() {
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  useEffect(() => {
    const client = createPublicClient({ 
      chain: holesky, 
      transport: http(HOLESKY_RPC_URL) 
    });
    setPublicClient(client);
  }, []);

  return publicClient;
}