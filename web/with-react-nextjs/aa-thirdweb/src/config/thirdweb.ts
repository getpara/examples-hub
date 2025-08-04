import { sepolia } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "";
export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY || "";

export const CHAIN = sepolia;
export const CHAIN_ID = 11155111;

export const thirdwebClient = (() => {
  if (THIRDWEB_SECRET_KEY) {
    return createThirdwebClient({
      secretKey: THIRDWEB_SECRET_KEY,
    });
  } else if (THIRDWEB_CLIENT_ID) {
    return createThirdwebClient({
      clientId: THIRDWEB_CLIENT_ID,
    });
  } else {
    console.warn(
      "Neither THIRDWEB_SECRET_KEY nor NEXT_PUBLIC_THIRDWEB_CLIENT_ID is defined. " +
        "Please set one of these in your environment variables."
    );
    return createThirdwebClient({
      clientId: "dummy",
    });
  }
})();

export const ENTRY_POINT = "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as const;

export const ACCOUNT_FACTORY = "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00" as const;
