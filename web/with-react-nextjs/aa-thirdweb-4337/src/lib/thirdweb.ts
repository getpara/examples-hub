import { createThirdwebClient } from "thirdweb";
import { sepolia as thirdwebSepolia } from "thirdweb/chains";
import { sepolia as viemSepolia } from "viem/chains";

export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? "";
export const THIRDWEB_CHAIN = thirdwebSepolia;
export const VIEM_CHAIN = viemSepolia;

if (!THIRDWEB_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Thirdweb features will not work.");
}

export const thirdwebClient = THIRDWEB_CLIENT_ID
  ? createThirdwebClient({
      clientId: THIRDWEB_CLIENT_ID,
    })
  : null;
