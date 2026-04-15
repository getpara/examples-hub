"use client";

import { useModal, useAccount, useWallet } from "@getpara/react-sdk";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { sign, message, isPending, error, signature } = useSignHelloWorld();

  const address = wallet?.address ?? "";

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
            <SignMessage
              message={message}
              onSign={sign}
              isPending={isPending}
              error={error}
              signature={signature}
            />
          </div>
        )}
      </main>
    </div>
  );
}
