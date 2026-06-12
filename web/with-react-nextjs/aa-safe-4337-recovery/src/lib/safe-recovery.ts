import { sepolia } from "viem/chains";

export const CHAIN = sepolia;
export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
export const SAFE_4337_MODULE_ADDRESS = "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226" as const;
export const SOCIAL_RECOVERY_MODULE_ADDRESS = "0x949d01d424bE050D09C16025dd007CB59b3A8c66" as const;
export const SAFE_VERSION = "1.4.1";
export const RECOVERY_PERIOD_SECONDS = 180;

export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

if (!PIMLICO_API_KEY) {
  console.warn("NEXT_PUBLIC_PIMLICO_API_KEY is not set. Sponsored Safe operations will not work.");
}
