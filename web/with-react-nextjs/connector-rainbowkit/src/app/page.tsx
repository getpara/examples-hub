"use client";

import { useAccount } from "wagmi";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export default function Home() {
  const { isConnected } = useAccount();
  const { sign, message, isPending, error, signature } = useSignHelloWorld();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + RainbowKit Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sign messages with your wallet via RainbowKit. This example demonstrates Para integration as a RainbowKit
          wallet connector.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard />
      ) : (
        <div className="max-w-xl mx-auto">
          <WalletInfo />
          <SignMessage
            message={message}
            onSign={sign}
            isPending={isPending}
            error={error}
            signature={signature}
          />
        </div>
      )}
    </div>
  );
}
