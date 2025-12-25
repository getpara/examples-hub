"use client";

import { useAccount, useWallet } from "@getpara/react-sdk";

export function Header() {
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-end">
        {isConnected && wallet?.address && (
          <span
            data-testid="account-address-display"
            className="px-4 py-2 text-gray-700 text-sm font-medium font-mono">
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
        )}
      </div>
    </header>
  );
}
