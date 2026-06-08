"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { ParaProvider } from "@/components/ParaProvider";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { SendTransaction } from "@/components/ui/SendTransaction";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { useThirdwebSponsoredTransaction } from "@/hooks/useThirdwebSponsoredTransaction";
import { THIRDWEB_CHAIN } from "@/lib/thirdweb";

export function Thirdweb4337Example() {
  return (
    <ParaProvider>
      <Thirdweb4337ExampleContent />
    </ParaProvider>
  );
}

function Thirdweb4337ExampleContent() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const {
    smartAccountAddress,
    targetAddress,
    transactionHash,
    accountError,
    transactionError,
    isAccountLoading,
    isSendingTransaction,
    canSendTransaction,
    sendSponsoredTransaction,
  } = useThirdwebSponsoredTransaction({ enabled: isConnected });

  const address = wallet?.address ?? "";
  const chainName = THIRDWEB_CHAIN.name ?? "Sepolia";

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
              smartAccountAddress={smartAccountAddress}
              chainName={chainName}
              isLoading={isAccountLoading}
              error={accountError}
            />
            <SendTransaction
              chainName={chainName}
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
