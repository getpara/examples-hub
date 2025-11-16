import { createThirdwebClient } from "thirdweb";
import { THIRDWEB_CLIENT_ID, THIRDWEB_SECRET_KEY } from "@/config/thirdweb";

// Create singleton thirdweb client
export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
  secretKey: THIRDWEB_SECRET_KEY,
  // Optional: Confirm sponsorship enabled in Thirdweb dashboard for your clientId
});