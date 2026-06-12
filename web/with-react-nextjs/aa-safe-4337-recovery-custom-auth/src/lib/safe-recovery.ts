import { sepolia } from "viem/chains";

export const CHAIN = sepolia;
export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
export const SOCIAL_RECOVERY_MODULE_ADDRESS = "0x949d01d424bE050D09C16025dd007CB59b3A8c66" as const;
export const SAFE_VERSION = "1.4.1";
export const RECOVERY_PERIOD_SECONDS = 180;

export const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "";
export const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
