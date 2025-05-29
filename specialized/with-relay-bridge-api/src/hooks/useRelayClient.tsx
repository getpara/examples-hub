import { useEffect, useState } from "react";
import { createClient, TESTNET_RELAY_API, RelayClient } from "@reservoir0x/relay-sdk";

export function useRelayClient() {
  const [client, setClient] = useState<RelayClient | null>(null);

  useEffect(() => {
    const relayClient = createClient({
      baseApiUrl: TESTNET_RELAY_API,
      source: "para-relay-bridge.app",
    });

    setClient(relayClient);
  }, []);

  return client;
}
