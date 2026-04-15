"use client";

import { useModal, useAccount, useWallet } from "@getpara/react-sdk";
import { useMultichainSign } from "@/hooks/useMultichainSign";
import { Header } from "@/components/layout/Header";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export default function Home() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { message, chains } = useMultichainSign();

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
            {chains.map((chain) => (
              <SignMessage
                key={chain.chainId}
                title={`Sign Message — ${chain.label}`}
                message={message}
                onSign={chain.sign}
                isPending={chain.isPending}
                error={chain.error}
                signature={chain.signature}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
