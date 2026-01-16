"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useAccount, useModal } from "@getpara/react-sdk";

export function WalletConnectionGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { openModal } = useModal();
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          You need to connect your wallet to access the bulk wallet generation functionality.
        </p>
        <Button
          onClick={() => openModal()}
          size="lg">
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
