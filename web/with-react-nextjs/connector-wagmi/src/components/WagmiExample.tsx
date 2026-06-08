"use client";

import { useCallback, useState } from "react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { Header } from "@/components/layout/Header";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TransactionHash } from "@/components/ui/TransactionHash";
import { TransferForm } from "@/components/ui/TransferForm";
import { useWagmiBalance } from "@/hooks/useWagmiBalance";
import { useWagmiEthTransfer } from "@/hooks/useWagmiEthTransfer";
import { useWagmiWalletConnection } from "@/hooks/useWagmiWalletConnection";

export function WagmiExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const wallet = useWagmiWalletConnection({
    onConnectSuccess: closeModal,
  });
  const balance = useWagmiBalance(wallet.address);
  const transfer = useWagmiEthTransfer({
    isConnected: wallet.isConnected,
  });

  return (
    <main className="min-h-screen">
      <ConnectWalletModal
        activeConnectorName={wallet.activeConnectorName}
        address={wallet.address}
        connectors={wallet.connectors}
        isConnected={wallet.isConnected}
        isOpen={isModalOpen}
        onClose={closeModal}
        onConnect={wallet.connectWallet}
        onDisconnect={() => {
          wallet.disconnectWallet();
          closeModal();
        }}
      />

      <Header
        address={wallet.address}
        isConnected={wallet.isConnected}
        onConnect={() => setIsModalOpen(true)}
      />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Wagmi connector
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Send Sepolia ETH with Wagmi
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use Para as a Wagmi connector, then send a Sepolia ETH transaction from the connected wallet.
          </p>
        </div>

        <div className="animate-fade-in-up-delayed mx-auto w-full max-w-xl">
          {!wallet.isConnected ? (
            <ConnectWalletCard onConnect={() => setIsModalOpen(true)} />
          ) : (
            <div className="space-y-4">
              <BalanceCard
                balance={balance.balance}
                isLoading={balance.isLoading}
                onRefresh={balance.refresh}
              />

              <StatusAlert
                message={transfer.status.message}
                show={transfer.status.show}
                type={transfer.status.type}
              />

              <TransferForm
                amount={transfer.amount}
                isLoading={transfer.isLoading}
                onAmountChange={transfer.setAmount}
                onSubmit={transfer.submit}
                onToChange={transfer.setTo}
                to={transfer.to}
              />

              <TransactionHash txHash={transfer.hash || ""} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
