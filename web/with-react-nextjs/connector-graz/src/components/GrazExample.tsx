"use client";

import { useEffect, useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { Provider } from "@/context/Provider";
import { Header } from "@/components/layout/Header";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { TransactionHash } from "@/components/ui/TransactionHash";
import { TransferForm } from "@/components/ui/TransferForm";
import { useGrazTokenTransfer } from "@/hooks/useGrazTokenTransfer";
import { useGrazWalletConnection } from "@/hooks/useGrazWalletConnection";

export function GrazExample() {
  return (
    <Provider>
      <GrazExampleContent />
    </Provider>
  );
}

function GrazExampleContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallet = useGrazWalletConnection();
  const transfer = useGrazTokenTransfer();

  useEffect(() => {
    if (wallet.connectStatus === "success") {
      setIsModalOpen(false);
    }
  }, [wallet.connectStatus]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isConnected={wallet.isConnected}
        address={wallet.address}
        onConnect={() => setIsModalOpen(true)}
      />

      <ConnectWalletModal
        isOpen={isModalOpen}
        isConnected={wallet.isConnected}
        connectedAddress={wallet.address}
        paraWallet={wallet.paraWallet}
        otherWallets={wallet.otherWallets}
        connectStatus={wallet.connectStatus}
        connectError={wallet.connectError}
        isDisconnecting={wallet.isDisconnecting}
        onConnect={wallet.connectWallet}
        onDisconnect={wallet.disconnectWallet}
        onClose={() => setIsModalOpen(false)}
      />

      <main
        className={
          wallet.isConnected
            ? "mx-auto w-full max-w-2xl px-4 py-10"
            : "flex-1 flex items-center justify-center px-4 pb-16"
        }>
        {!wallet.isConnected ? (
          <ConnectWalletCard onConnect={() => setIsModalOpen(true)} />
        ) : (
          <div className="w-full space-y-4">
            <BalanceCard
              address={transfer.address}
              networkName={transfer.networkName}
              balanceLabel={transfer.balanceLabel}
              isLoading={transfer.isBalanceLoading}
              hasBalance={transfer.hasBalance}
              faucetUrl={transfer.faucetUrl}
              onRefresh={transfer.refreshBalance}
            />
            <TransferForm
              faucetAddress={transfer.faucetAddress}
              amount={transfer.amount}
              denom={transfer.displayDenom}
              isLoading={transfer.isSending}
              isReady={transfer.canSend}
              error={transfer.error}
              onAmountChange={transfer.setAmount}
              onSubmit={transfer.sendTokensToFaucet}
            />
            <TransactionHash transactionHash={transfer.transactionHash} />
          </div>
        )}
      </main>
    </div>
  );
}
