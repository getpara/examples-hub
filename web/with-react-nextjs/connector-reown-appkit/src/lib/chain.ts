import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

export const NETWORKS = [mainnet, arbitrum, optimism, polygon, base] as const;
