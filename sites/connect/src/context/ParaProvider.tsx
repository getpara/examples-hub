'use client';

import { EXTERNAL_WALLET_TYPES, ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { mainnet } from 'wagmi/chains';
import { cosmoshub } from 'graz/chains';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

const solanaNetwork = WalletAdapterNetwork.Mainnet;

const endpoint = clusterApiUrl(solanaNetwork);

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ParaSDKProvider
      paraClientConfig={{
        apiKey: process.env.NEXT_PUBLIC_API_KEY ?? '',
      }}
      config={{ appName: 'Para Portal', disableEmbeddedModal: true }}
      paraModalConfig={{
        oAuthMethods: ['GOOGLE', 'APPLE', 'DISCORD', 'FACEBOOK', 'TWITTER', 'TELEGRAM', 'FARCASTER'],
        bareModal: true,
        isOpen: true,
      }}
      externalWalletConfig={{
        wallets: [...EXTERNAL_WALLET_TYPES],
        createLinkedEmbeddedForExternalWallets: 'ALL',
        walletConnect: {
          projectId: 'dc87c564a371d823d3795ae407391656',
        },
        evmConnector: {
          config: {
            chains: [mainnet],
          },
        },
        cosmosConnector: {
          config: {
            selectedChainId: cosmoshub.chainId,
            multiChain: false,
            onSwitchChain: () => {},
            chains: [cosmoshub],
          },
        },
        solanaConnector: {
          config: {
            endpoint: endpoint,
            chain: solanaNetwork,
          },
        },
      }}
    >
      {children}
    </ParaSDKProvider>
  );
}
