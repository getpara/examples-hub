import { sepolia } from "thirdweb/chains";
import { DEFAULT_ACCOUNT_FACTORY_V0_7 } from "thirdweb/wallets/smart";

// Client ID can be public (for client-side usage)
export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";

// Secret key should only be used server-side
export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "";

// Validate environment variables
if (!THIRDWEB_CLIENT_ID && !THIRDWEB_SECRET_KEY) {
  console.warn(
    "⚠️ No Thirdweb credentials found. Set NEXT_PUBLIC_THIRDWEB_CLIENT_ID (for client) or THIRDWEB_SECRET_KEY (for server) in your .env file"
  );
}

export const CHAIN = sepolia;
export const CHAIN_ID = 11155111;

// Account factory address - using v0.7 for consistency across prediction and deployment
export const ACCOUNT_FACTORY = DEFAULT_ACCOUNT_FACTORY_V0_7;
