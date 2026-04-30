"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useCantonOnboarding } from "@/hooks/useCantonOnboarding";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { CantonOnboardCard } from "@/components/ui/CantonOnboardCard";
import { CantonPreapprovalCard } from "@/components/ui/CantonPreapprovalCard";
import { CantonTapCard } from "@/components/ui/CantonTapCard";
import { CantonSendCard } from "@/components/ui/CantonSendCard";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const {
    onboard,
    isPending,
    error,
    multiHash,
    partyId,
    address = "",
    installPreapproval,
    isInstallingPreapproval,
    preapprovalError,
    preapprovalHash,
    preapprovalUpdateId,
    sendAmulet,
    isSending,
    sendError,
    sendHash,
    sendUpdateId,
    tapAmulet,
    isTapping,
    tapError,
    tapHash,
    tapUpdateId,
    fetchBalance,
    balance,
    isFetchingBalance,
    balanceError,
  } = useCantonOnboarding();

  return (
    <div className="min-h-screen flex flex-col">
      <Header isConnected={isConnected} address={address} partyId={partyId} onConnect={openModal} />

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
            <WalletInfo
              address={address}
              partyId={partyId}
              balance={balance}
              isFetchingBalance={isFetchingBalance}
              balanceError={balanceError}
              onRefreshBalance={fetchBalance}
            />
            <CantonOnboardCard
              onOnboard={onboard}
              isPending={isPending}
              error={error}
              multiHash={multiHash}
              partyId={partyId}
            />
            {partyId && (
              <CantonPreapprovalCard
                onInstall={installPreapproval}
                isPending={isInstallingPreapproval}
                error={preapprovalError}
                preparedHash={preapprovalHash}
                updateId={preapprovalUpdateId}
              />
            )}
            {partyId && (
              <CantonTapCard
                onTap={tapAmulet}
                isPending={isTapping}
                error={tapError}
                preparedHash={tapHash}
                updateId={tapUpdateId}
              />
            )}
            {partyId && (
              <CantonSendCard
                onSend={sendAmulet}
                isPending={isSending}
                error={sendError}
                preparedHash={sendHash}
                updateId={sendUpdateId}
                defaultReceiverPartyId={partyId}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
