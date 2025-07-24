"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useLogout, useModal, useWallet } from "@getpara/react-sdk";
import { Wallet } from "lucide-react";

export default function Header() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { logout } = useLogout();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="font-bold text-xl">Wallet App</div>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {wallet?.address?.slice(0, 6) ?? "------"}...{wallet?.address?.slice(-4) ?? "----"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={() => openModal()}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
