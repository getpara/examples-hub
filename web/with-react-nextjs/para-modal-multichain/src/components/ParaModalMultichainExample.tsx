"use client";

import { useParaModalMultichainWallet } from "@/hooks/useParaModalMultichainWallet";
import { useMultichainSign } from "@/hooks/useMultichainSign";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export function ParaModalMultichainExample() {
  const wallet = useParaModalMultichainWallet();
  const signing = useMultichainSign();

  return (
    <div className="flex min-h-screen flex-col">
      <Header isConnected={wallet.isConnected} address={wallet.address} onConnect={wallet.openModal} />

      <main
        className={
          wallet.isConnected
            ? "mx-auto w-full max-w-xl px-4 py-10"
            : "flex flex-1 items-center justify-center px-4 pb-16"
        }>
        {!wallet.isConnected ? (
          <ConnectCard onConnect={wallet.openModal} />
        ) : (
          <div className="space-y-4">
            <WalletInfo address={wallet.address} />
            <div
              data-testid="embedded-wallets"
              className="hidden">
              {JSON.stringify(signing.wallets)}
            </div>
            {signing.chains.map((chain) => (
              <SignMessage
                key={chain.chainId}
                testId={`sign-card-${chain.chainId}`}
                title={`Sign Message - ${chain.label}`}
                message={signing.message}
                onSign={chain.sign}
                isPending={chain.isPending}
                errorMessage={chain.errorMessage}
                signature={chain.signature}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
