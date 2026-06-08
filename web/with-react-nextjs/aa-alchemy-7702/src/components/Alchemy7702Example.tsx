"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { SendTransaction } from "@/components/ui/SendTransaction";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useAlchemy7702SponsoredTransaction } from "@/hooks/useAlchemy7702SponsoredTransaction";
import { CHAIN } from "@/lib/alchemy";

export function Alchemy7702Example() {
  return (
    <ParaProvider>
      <Alchemy7702ExampleContent />
    </ParaProvider>
  );
}

function Alchemy7702ExampleContent() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const {
    delegatedAccountAddress,
    targetAddress,
    transactionHash,
    accountError,
    transactionError,
    isAccountLoading,
    isSendingTransaction,
    canSendTransaction,
    sendSponsoredTransaction,
  } = useAlchemy7702SponsoredTransaction({ enabled: isConnected });

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
              delegatedAccountAddress={delegatedAccountAddress}
              isLoading={isAccountLoading}
              error={accountError}
            />
            <SendTransaction
              chainName={CHAIN.name}
              targetAddress={targetAddress}
              onSend={sendSponsoredTransaction}
              isPending={isSendingTransaction}
              error={transactionError}
              transactionHash={transactionHash}
              isReady={canSendTransaction}
            />
          </div>
        )}
      </main>
    </div>
  );
}
