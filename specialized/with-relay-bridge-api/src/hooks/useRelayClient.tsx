import { useEffect, useState } from "react";
import { createClient, TESTNET_RELAY_API, RelayClient } from "@reservoir0x/relay-sdk";

export function useRelayClient() {
  const [client, setClient] = useState<RelayClient | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      try {
        const response = await fetch("https://api.testnets.relay.link/chains");
        const data = await response.json();

        const supportedChainIds = [11155111, 84532, 1936682084];
        const supportedChains = data.chains.filter((chain: any) => supportedChainIds.includes(chain.id));

        const relayClient = createClient({
          baseApiUrl: TESTNET_RELAY_API,
          source: "para-relay-bridge.app",
          chains: supportedChains,
        });

        setClient(relayClient);
      } catch (error) {
        console.error("Failed to setup Relay client:", error);
      }
    };

    setupClient();
  }, []);

  return client;
}
