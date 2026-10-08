import { createClient, http } from "viem";
import { BASE_SEPOLIA } from "@/lib/chain";

export const PORTO_RELAY_URL = "https://rpc.porto.sh";

export const PORTO_RELAY_LABEL = new URL(PORTO_RELAY_URL).host;

export const portoClient = createClient({
  chain: BASE_SEPOLIA.chain,
  transport: http(PORTO_RELAY_URL),
});
