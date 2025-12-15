"use client";

import { useModal, useAccount, useClient } from "@getpara/react-sdk";
import { useE2ECleanup } from "@/lib/e2e-helpers";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { ConnectCard } from "@/components/ui/ConnectCard";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { SignMessage } from "@/components/ui/SignMessage";

export default function Home() {
  // Para SDK hooks
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const para = useClient();

  // Sign message hook
  const { sign, message, isPending, error, signature } = useSignHelloWorld();

  // E2E testing cleanup (internal only - safe to remove)
  useE2ECleanup(para);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para Modal Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Sign messages with your Para wallet. This example demonstrates the simplest integration using Para&apos;s
          built-in modal and React SDK hooks.
        </p>
      </div>

      {!isConnected ? (
        <ConnectCard onConnect={openModal} />
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
