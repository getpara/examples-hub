import { Environment } from "@getpara/react-sdk-lite";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

// Sui Testnet endpoints. @mysten/sui has deprecated JSON-RPC in favour of gRPC, and the public
// JSON-RPC testnet fullnode is being retired — so this example uses the non-deprecated gRPC client
// against the testnet fullnode (which speaks gRPC-web). The faucet host comes from @mysten/sui/faucet.
export const SUI_NETWORK = "testnet" as const;
export const SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";
export const SUI_EXPLORER_URL = "https://suiscan.xyz/testnet";
