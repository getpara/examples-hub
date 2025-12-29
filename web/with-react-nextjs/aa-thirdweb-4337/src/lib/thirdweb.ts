import { createThirdwebClient } from "thirdweb";
import { sepolia } from "viem/chains";

export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? "";
export const CHAIN = sepolia;

if (!THIRDWEB_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Thirdweb features will not work.");
}

export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});
