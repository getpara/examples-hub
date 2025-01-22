"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { capsule } from "@/client/capsule";
import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
} from "@usecapsule/evm-wallet-connectors";
import { CapsuleCosmosProvider, keplrWallet, leapWallet } from "@usecapsule/cosmos-wallet-connectors";
import { cosmoshub } from "@usecapsule/graz/chains";
import { backpackWallet, CapsuleSolanaProvider, glowWallet, phantomWallet } from "@usecapsule/solana-wallet-connectors";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  const cosmosChains = [
    {
      ...cosmoshub,
      rpc: "https://rpc.cosmos.directory/cosmoshub",
      rest: "https://rest.cosmos.directory/cosmoshub",
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <CapsuleEvmProvider
        config={{
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          appName: "Capsule EVM Wallet Connect",
          chains: [mainnet, polygon, sepolia, celo],
          wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
          capsule: capsule,
        }}>
        <CapsuleCosmosProvider
          chains={cosmosChains}
          wallets={[keplrWallet, leapWallet]}
          selectedChainId={cosmoshub.chainId}
          multiChain={false}
          onSwitchChain={(chainId) => {
            console.log("Switched chain to:", chainId);
          }}>
          <CapsuleSolanaProvider
            endpoint={endpoint}
            wallets={[glowWallet, phantomWallet, backpackWallet]}
            chain={solanaNetwork}
            appIdentity={{
              name: "Your App Name",
              uri: typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "",
            }}>
            {children}
          </CapsuleSolanaProvider>
        </CapsuleCosmosProvider>
      </CapsuleEvmProvider>
    </QueryClientProvider>
  );
};
