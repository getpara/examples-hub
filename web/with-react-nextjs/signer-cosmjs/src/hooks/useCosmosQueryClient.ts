import { useState, useEffect } from "react";
import {
  QueryClient,
  setupBankExtension,
  setupGovExtension,
  setupStakingExtension,
  type BankExtension,
  type GovExtension,
  type StakingExtension,
} from "@cosmjs/stargate";
import { connectComet } from "@cosmjs/tendermint-rpc";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

export type CosmosQueryClient = QueryClient & BankExtension & StakingExtension & GovExtension;

export function useCosmosQueryClient() {
  const [queryClient, setQueryClient] = useState<CosmosQueryClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const connectQueryClient = async () => {
      try {
        const cometClient = await connectComet(ICS_PROVIDER_TESTNET.rpcUrl);
        setQueryClient(
          QueryClient.withExtensions(cometClient, setupBankExtension, setupStakingExtension, setupGovExtension)
        );
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
