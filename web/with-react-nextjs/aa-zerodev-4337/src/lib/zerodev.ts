import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { sepolia } from "viem/chains";

export const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID ?? "";
export const CHAIN_ID = 11155111;
export const BUNDLER_RPC = `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${CHAIN_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${CHAIN_ID}`;
export const PUBLIC_RPC = `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${CHAIN_ID}`;

export const ENTRY_POINT = getEntryPoint("0.7");
export const KERNEL_VERSION = KERNEL_V3_1;
export const CHAIN = sepolia;

if (!ZERODEV_PROJECT_ID) {
  console.warn("NEXT_PUBLIC_ZERODEV_PROJECT_ID is not set. ZeroDev features will not work.");
}
