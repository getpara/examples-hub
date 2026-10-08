import { useState, useEffect } from "react";
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { useCosmosWalletConnection } from "@/hooks/useCosmosWalletConnection";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

export function useParaSigner() {
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, protoSigner, address, error: accountError, isLoading: isSignerLoading } = useCosmosWalletConnection();

  useEffect(() => {
    if (!isConnected || !protoSigner) {
      setSigningClient(null);
      setError(null);
      setIsConnecting(false);
      return;
    }

    let mounted = true;

    const connectClient = async () => {
      setIsConnecting(true);
      try {
        const client = await SigningStargateClient.connectWithSigner(
          ICS_PROVIDER_TESTNET.rpcUrl,
          protoSigner,
          { gasPrice: GasPrice.fromString(ICS_PROVIDER_TESTNET.gasPrice) }
        );

        if (mounted) {
          setSigningClient(client);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setSigningClient(null);
          setError(err instanceof Error ? err : new Error("Failed to connect signing client"));
          console.error("Error connecting Para signer:", err);
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    connectClient();

    return () => {
      mounted = false;
    };
  }, [isConnected, protoSigner]);

  const isLoading = isSignerLoading || isConnecting;

  return { signingClient, address: address || null, isLoading, error: accountError ?? error };
}
