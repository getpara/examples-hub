"use client";

import { ChainProvider } from "@cosmos-kit/react";
import { assets, chains } from "chain-registry";
import { wallets as leapSocial } from "@cosmos-kit/leap-capsule-social-login";

type Props = {
  children: React.ReactNode;
};

export const ParaProviders: React.FC<Props> = ({ children }) => {
  return (
    <ChainProvider
      chains={chains}
      assetLists={[...assets]}
      wallets={[...leapSocial]}
      throwErrors={false}
      subscribeConnectEvents={false}
      defaultNameService={"stargaze"}
      logLevel={"DEBUG"}
      endpointOptions={{
        isLazy: true,
        endpoints: {
          cosmoshub: {
            rpc: [
              {
                url: "https://rpc.cosmos.directory/cosmoshub",
                headers: {},
              },
            ],
          },
        },
      }}>
      {children}
    </ChainProvider>
  );
};
