import { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import { Arc, Base } from "@circle-fin/bridge-kit/chains";
import { createPublicClient, createWalletClient, http, type Chain, type LocalAccount } from "viem";
import { ARC, BASE } from "@/lib/chain";

const RPC_URL_BY_CHAIN_ID = new Map<number, string>([
  [BASE.chain.id, BASE.rpcUrl],
  [ARC.chain.id, ARC.rpcUrl],
]);

function rpcUrlFor(chain: Chain) {
  const rpcUrl = RPC_URL_BY_CHAIN_ID.get(chain.id);

  if (!rpcUrl) {
    throw new Error(`No RPC URL is configured for chain ${chain.id}.`);
  }

  return rpcUrl;
}

function createChainPinnedWalletClient(account: LocalAccount, chain: Chain) {
  return createWalletClient({ account, chain, transport: http(rpcUrlFor(chain)) }).extend(() => ({
    async switchChain({ id }: { id: number }) {
      if (id !== chain.id) {
        throw new Error(`This wallet client signs for chain ${chain.id} only.`);
      }
    },
  }));
}

export function createBridgeAdapter(account: LocalAccount) {
  return new ViemAdapter(
    {
      getPublicClient: ({ chain }) => createPublicClient({ chain, transport: http(rpcUrlFor(chain)) }),
      getWalletClient: ({ chain }) => createChainPinnedWalletClient(account, chain),
    },
    { addressContext: "user-controlled", supportedChains: [Base, Arc] }
  );
}

export type BridgeAdapter = ReturnType<typeof createBridgeAdapter>;
