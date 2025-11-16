"use client";

import { useAccount, useModal, useWallet } from "@getpara/react-sdk";

export function Header() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <div>
          {isConnected ? (
            <button
              onClick={() => openModal()}
              data-testid="account-address-display"
              className="px-4 py-2 bg-gray-700 text-white rounded-none hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer">
              Connected: {wallet?.address?.slice(0, 6)}...
              {wallet?.address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => openModal()}
              data-testid="header-connect-button"
              className="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium cursor-pointer">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
