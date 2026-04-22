"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useCantonOnboarding } from "@/hooks/useCantonOnboarding";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { CantonOnboardCard } from "@/components/ui/CantonOnboardCard";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { onboard, isPending, error, multiHash, partyId, address = "" } = useCantonOnboarding();

  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} address={address} onConnect={openModal} />

      <main
        className={
          isConnected
            ? "mx-auto w-full max-w-xl px-4 py-10"
            : "flex-1 flex items-center justify-center px-4 pb-16"
        }>
        {!isConnected ? (
          <ConnectCard onConnect={openModal} />
        ) : (
          <div className="space-y-4">
            <WalletInfo address={address} />
            <CantonOnboardCard
              onOnboard={onboard}
              isPending={isPending}
              error={error}
              multiHash={multiHash}
              partyId={partyId}
            />
          </div>
        )}
      </main>
    </div>
  );
}
