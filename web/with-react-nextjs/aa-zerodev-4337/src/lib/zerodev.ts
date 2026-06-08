import { sepolia } from "viem/chains";

export const ZERODEV_PROJECT_ID = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID ?? "";
export const CHAIN = sepolia;

if (!ZERODEV_PROJECT_ID) {
  console.warn("NEXT_PUBLIC_ZERODEV_PROJECT_ID is not set. ZeroDev features will not work.");
}
