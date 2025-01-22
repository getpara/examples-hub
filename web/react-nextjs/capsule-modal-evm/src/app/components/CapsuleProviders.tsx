"use client";

import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
} from "@usecapsule/evm-wallet-connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { capsule } from "@/client/capsule";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <CapsuleEvmProvider
        config={{
          projectId: "your_wallet_connect_project_id",
          appName: "Capsule EVM Wallet Connect",
          chains: [mainnet, polygon, sepolia, celo],
          wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
          capsule: capsule,
        }}>
        {children}
      </CapsuleEvmProvider>
    </QueryClientProvider>
  );
};
