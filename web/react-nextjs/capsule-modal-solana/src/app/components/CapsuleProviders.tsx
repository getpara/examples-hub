"use client";
import { backpackWallet, CapsuleSolanaProvider, glowWallet, phantomWallet } from "@usecapsule/solana-wallet-connectors";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
};

const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);
const queryClient = new QueryClient();

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};
