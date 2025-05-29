import { useEffect, useState } from "react";
import { createClient, TESTNET_RELAY_API, RelayClient } from "@reservoir0x/relay-sdk";
import { NETWORK_CONFIG } from "@/constants";

export function useRelayClient() {
  const [client, setClient] = useState<RelayClient | null>(null);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const response = await fetch(`${TESTNET_RELAY_API}/chains`);
        const data = await response.json();

        const supportedChainIds = Object.values(NETWORK_CONFIG).map((config) => config.chainId);

        const supportedChains = data.chains.filter((chain: any) => supportedChainIds.includes(chain.id));

        const relayClient = createClient({
          baseApiUrl: TESTNET_RELAY_API,
          source: "para-relay-bridge.app",
          chains: supportedChains,
        });

        setClient(relayClient);
      } catch (error) {
        console.error("Failed to initialize Relay client:", error);
      }
    };

    initializeClient();
  }, []);

  return client;
}
