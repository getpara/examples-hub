"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";

export function Header() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  const buttonText = isConnected
    ? `Connected: ${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`
    : "Connect Wallet";

  const handleConnectClick = () => {
    openModal();
  };

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <button
          onClick={handleConnectClick}
          className="px-4 py-2 text-white rounded-none transition-colors text-sm font-medium cursor-pointer bg-gray-900 hover:bg-gray-950">
          {buttonText}
        </button>
      </div>
    </header>
  );
}
