"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { para } from "@/client/para";
import {
  ParaEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
} from "@getpara/evm-wallet-connectors";
import { ParaCosmosProvider, keplrWallet, leapWallet } from "@getpara/cosmos-wallet-connectors";
import { cosmoshub } from "@getpara/graz/chains";
import { backpackWallet, ParaSolanaProvider, glowWallet, phantomWallet } from "@getpara/solana-wallet-connectors";

type Props = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export const ParaProviders: React.FC<Props> = ({ children }) => {
  const cosmosChains = [
    {
      ...cosmoshub,
      rpc: "https://rpc.cosmos.directory/cosmoshub",
      rest: "https://rest.cosmos.directory/cosmoshub",
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <ParaEvmProvider
        config={{
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          appName: "Para EVM Wallet Connect",
          chains: [mainnet, polygon, sepolia, celo],
          wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
          para: para,
        }}>
        <ParaCosmosProvider
          chains={cosmosChains}
          wallets={[keplrWallet, leapWallet]}
          selectedChainId={cosmoshub.chainId}
          multiChain={false}
          onSwitchChain={(chainId) => {
            console.log("Switched chain to:", chainId);
          }}>
          <ParaSolanaProvider
            endpoint={endpoint}
            wallets={[glowWallet, phantomWallet, backpackWallet]}
            chain={solanaNetwork}
            appIdentity={{
              name: "Your App Name",
              uri: typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "",
            }}>
            {children}
          </ParaSolanaProvider>
        </ParaCosmosProvider>
      </ParaEvmProvider>
    </QueryClientProvider>
  );
};
