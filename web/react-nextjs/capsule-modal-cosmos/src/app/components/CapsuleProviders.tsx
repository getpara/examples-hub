"use client";

import React from "react";
import { CapsuleCosmosProvider, keplrWallet, leapWallet } from "@usecapsule/cosmos-wallet-connectors";
import { cosmoshub } from "@usecapsule/graz/chains";

type Props = {
  children: React.ReactNode;
};

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  // Example chain config for Cosmos Hub; you can add more as needed.
  const cosmosChains = [
    {
      ...cosmoshub,
      rpc: "https://rpc.cosmos.directory/cosmoshub",
      rest: "https://rest.cosmos.directory/cosmoshub",
    },
  ];

  return (
    <CapsuleCosmosProvider
      chains={cosmosChains}
      wallets={[keplrWallet, leapWallet]}
      selectedChainId={cosmoshub.chainId}
      multiChain={false}
      onSwitchChain={(chainId) => {
        console.log("Switched chain to:", chainId);
      }}>
      {children}
    </CapsuleCosmosProvider>
  );
};
