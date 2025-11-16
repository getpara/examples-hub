export const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC || "";
export const GAS_POLICY_ID = process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID || "";

if (!ALCHEMY_RPC_URL) {
  console.warn(
    "ALCHEMY_RPC_URL is not defined. Please set NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC in your environment variables."
  );
}
