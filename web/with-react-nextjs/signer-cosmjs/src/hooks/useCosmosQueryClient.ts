"use client";

import { useState, useEffect } from "react";
import { StargateClient } from "@cosmjs/stargate";
import { DEFAULT_CHAIN } from "@/config/chains";

export function useCosmosQueryClient() {
  const [queryClient, setQueryClient] = useState<StargateClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const connectQueryClient = async () => {
      try {
        const client = await StargateClient.connect(DEFAULT_CHAIN.rpc);
        setQueryClient(client);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to connect query client"));
        console.error("Error connecting query client:", err);
      } finally {
        setLoading(false);
      }
    };

    connectQueryClient();
  }, []);

  return { queryClient, loading, error };
}