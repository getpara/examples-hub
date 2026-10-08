export const HELLO_WORLD_MESSAGE = "Hello World!";

export const SOLANA_DEVNET_RPC_URL = "https://api.devnet.solana.com";

export const STELLAR_TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

export type ChainId = "evm" | "cosmos" | "solana" | "stellar";

export const CHAINS = {
  evm: { label: "EVM", network: "Sepolia", mark: "ethereum" },
  cosmos: { label: "Cosmos", network: "Cosmos Hub", mark: "cosmos" },
  solana: { label: "Solana", network: "Devnet", mark: "solana" },
  stellar: { label: "Stellar", network: "Testnet", mark: "stellar" },
} as const satisfies Record<ChainId, { label: string; network: string; mark: string }>;

export const SIGN_IN_NETWORK_LABEL = "Sepolia testnet";

export function formatChainCount(count: number) {
  return count === 1 ? "1 chain" : `${count} chains`;
}
