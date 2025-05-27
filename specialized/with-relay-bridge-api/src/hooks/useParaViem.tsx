import { useState, useCallback, useEffect } from "react";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { createPublicClient, http, PublicClient, WalletClient } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { useClient, useAccount } from "@getpara/react-sdk";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";

const CHAIN_MAP = {
  ethereum: sepolia,
  base: baseSepolia,
} as const;

interface UseParaViemOptions {
  network: SupportedNetwork;
}

interface UseParaViemReturn {
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  address: string | null;
  isInitialized: boolean;
  initializeClients: () => void;
  clearClients: () => void;
  networkConfig: (typeof NETWORK_CONFIG)[SupportedNetwork];
}

export function useParaViem(options: UseParaViemOptions): UseParaViemReturn {
  const { network } = options;
  const para = useClient();
  const { data: paraAccount } = useAccount();
  const networkConfig = NETWORK_CONFIG[network];

  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const initializeClients = useCallback(() => {
    if (!para || !paraAccount?.isConnected) {
      return;
    }

    if (networkConfig.networkCategory !== "evm") {
      return;
    }

    const chain = CHAIN_MAP[network as keyof typeof CHAIN_MAP];
    if (!chain) {
      return;
    }

    try {
      const account = createParaAccount(para);
      const paraWalletClient = createParaViemClient(para, {
        account,
        chain,
        transport: http(networkConfig.rpcUrl),
      });

      const paraPublicClient = createPublicClient({
        chain,
        transport: http(networkConfig.rpcUrl),
      });

      setWalletClient(paraWalletClient);
      setPublicClient(paraPublicClient as PublicClient);
      setAddress(account.address);
    } catch (error) {
      console.error(`[useParaViem ${network}] Initialization error:`, error);
      clearClients();
    }
  }, [para, paraAccount, network, networkConfig]);

  const clearClients = useCallback(() => {
    setWalletClient(null);
    setPublicClient(null);
    setAddress(null);
  }, []);

  useEffect(() => {
    return () => {
      clearClients();
    };
  }, [clearClients]);

  const isInitialized = Boolean(networkConfig.networkCategory === "evm" && publicClient && walletClient && address);

  return {
    publicClient,
    walletClient,
    address,
    isInitialized,
    initializeClients,
    clearClients,
    networkConfig,
  };
}
