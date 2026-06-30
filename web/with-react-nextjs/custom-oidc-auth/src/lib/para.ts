import { Environment } from "@getpara/react-sdk";

export const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

export const PARA_ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment | undefined) ?? Environment.BETA;

// Faucet, signer, and explorer all target Sepolia so the demo's request-faucet →
// send-transaction → view-on-Etherscan flow stays on one chain.
export const SEPOLIA_CHAIN_ID = 11155111;

// Chain identifier the Para faucet expects (see RequestFaucetParams.chain).
export const FAUCET_CHAIN = "ETHEREUM_SEPOLIA";

// Sepolia faucet wallet used by the backend for this demo environment.
export const SEPOLIA_FAUCET_RETURN_ADDRESS = "0x328690d91d405c14d8e4cd1306e2ca192a17d32e";

// Public Sepolia RPC by default; override with NEXT_PUBLIC_SEPOLIA_RPC_URL for a private endpoint.
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export const SEPOLIA_EXPLORER_TX_URL = "https://sepolia.etherscan.io/tx";
