"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { UpgradeAccount } from "@/components/ui/UpgradeAccount";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { usePorto7702Account } from "@/hooks/usePorto7702Account";
import { PORTO_CHAIN, PORTO_RELAY_URL } from "@/lib/porto";

export function Porto7702Example() {
  return (
    <ParaProvider>
      <Porto7702ExampleContent />
    </ParaProvider>
  );
}

function Porto7702ExampleContent() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const {
    walletAddress,
    portoAccountAddress,
    isViemLoading,
    isCheckingStatus,
    isUpgrading,
    isUpgraded,
    canUpgrade,
    error,
    adminKeyCount,
    sessionKeyCount,
    upgradeToPorto,
  } = usePorto7702Account({ enabled: isConnected });

  const address = wallet?.address ?? walletAddress ?? "";

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
              portoAccountAddress={portoAccountAddress}
              chainName={PORTO_CHAIN.name}
              relayUrl={PORTO_RELAY_URL}
              isLoading={isViemLoading || isCheckingStatus}
            />
            <UpgradeAccount
              isUpgraded={isUpgraded}
              isPending={isUpgrading}
              isReady={canUpgrade}
              adminKeyCount={adminKeyCount}
              sessionKeyCount={sessionKeyCount}
              error={error}
              onUpgrade={upgradeToPorto}
            />
          </div>
        )}
      </main>
    </div>
  );
}
