import { useAccount } from "@getpara/react-sdk";
import type { ChainId } from "@/lib/chain";

const CHAIN_WALLET_TYPES = [
  { chainId: "evm", walletType: "EVM", externalNetwork: "evm" },
  { chainId: "cosmos", walletType: "COSMOS", externalNetwork: "cosmos" },
  { chainId: "solana", walletType: "SOLANA", externalNetwork: "solana" },
  { chainId: "stellar", walletType: "STELLAR", externalNetwork: null },
] as const satisfies ReadonlyArray<{ chainId: ChainId; walletType: string; externalNetwork: string | null }>;

export function useConnectedChains() {
  const { embedded, external } = useAccount();
  const wallets = embedded.wallets ?? [];
  const connectedNetworks = external.connectedNetworks ?? [];

  const chains = CHAIN_WALLET_TYPES.flatMap(({ chainId, walletType, externalNetwork }) => {
    const wallet = wallets.find((candidate) => candidate.type === walletType);
    const isExternallyConnected = externalNetwork !== null && connectedNetworks.includes(externalNetwork);

    return wallet || isExternallyConnected ? [{ chainId, address: wallet?.address }] : [];
  });

  return {
    chains,
    wallets: wallets.map(({ id, type, address }) => ({ id, type, address })),
  };
}
