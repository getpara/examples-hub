"use client";

import React from "react";
import { ParaCosmosProvider, keplrWallet, leapWallet } from "@getpara/cosmos-wallet-connectors";
import { cosmoshub } from "@getpara/graz/chains";

type Props = {
  children: React.ReactNode;
};

// Example chain config for Cosmos Hub; you can add more as needed.
const cosmosChains = [
  {
    ...cosmoshub,
    rpc: "https://rpc.cosmos.directory/cosmoshub",
    rest: "https://rest.cosmos.directory/cosmoshub",
  },
];

export const ParaProviders: React.FC<Props> = ({ children }) => {
  return (
    <ParaCosmosProvider
      chains={cosmosChains}
      wallets={[keplrWallet, leapWallet]}
      selectedChainId={cosmoshub.chainId}
      multiChain={false}
      onSwitchChain={(chainId) => {
        console.log("Switched chain to:", chainId);
      }}>
      {children}
    </ParaCosmosProvider>
  );
};
