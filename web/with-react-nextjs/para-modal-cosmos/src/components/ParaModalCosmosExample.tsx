"use client";

import { useParaModalCosmosWallet } from "@/hooks/useParaModalCosmosWallet";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export function ParaModalCosmosExample() {
  const wallet = useParaModalCosmosWallet();
  const signing = useSignHelloWorld();

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
            <SignMessage
              message={signing.message}
              onSign={signing.sign}
              isPending={signing.isPending}
              errorMessage={signing.errorMessage}
              signature={signing.signature}
            />
          </div>
        )}
      </main>
    </div>
  );
}
