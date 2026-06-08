"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { GlobalWalletActions } from "@/components/ui/GlobalWalletActions";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useRhinestoneGlobalWallet } from "@/hooks/useRhinestoneGlobalWallet";

export function Rhinestone4337Example() {
  return (
    <ParaProvider>
      <Rhinestone4337ExampleContent />
    </ParaProvider>
  );
}

function Rhinestone4337ExampleContent() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const {
    accountAddress,
    portfolio,
    isLoading,
    error,
    refreshPortfolio,
    supportedChains,
  } = useRhinestoneGlobalWallet({ enabled: isConnected });

  const address = wallet?.address ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} address={address} onConnect={openModal} />

      <main
        className={
          isConnected
            ? "mx-auto w-full max-w-2xl px-4 py-10"
            : "flex-1 flex items-center justify-center px-4 pb-16"
        }>
        {!isConnected ? (
          <ConnectCard onConnect={openModal} />
        ) : (
          <div className="w-full space-y-4">
            <WalletInfo
              walletAddress={address}
              globalWalletAddress={accountAddress}
              isLoading={isLoading}
              error={error}
            />
            <GlobalWalletActions
              portfolioCount={portfolio.length}
              supportedChains={supportedChains}
              onRefresh={refreshPortfolio}
              isRefreshing={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}
