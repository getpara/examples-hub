"use client";

import { useModal, useAccount } from "@getpara/react-sdk";

interface HeaderProps {
  isPregenReady?: boolean;
}

export function Header({ isPregenReady = false }: HeaderProps) {
  const { openModal } = useModal();
  const { data: account } = useAccount();

  return (
    <header className="flex items-center justify-between p-6">
      <h1 className="text-2xl font-bold text-gray-900">Para Pregen Claim</h1>
      
      <button
        onClick={() => openModal()}
        disabled={!isPregenReady}
        className={`
          px-4 py-2 rounded-md font-medium transition-colors
          ${isPregenReady 
            ? "bg-gray-900 text-white hover:bg-gray-700" 
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {account?.isConnected ? "Connected" : "Connect Wallet"}
      </button>
    </header>
  );
}