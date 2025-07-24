"use client";

import { useAccount, useModal } from "@getpara/react-sdk";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { isConnected } = useAccount();
  const { openModal } = useModal();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Relay Bridge Integration</h1>
        <Button onClick={() => openModal()} variant={isConnected ? "outline" : "default"}>
          {isConnected ? "Connected" : "Connect Wallet"}
        </Button>
      </div>
    </header>
  );
}