"use client";

import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  const { setSelectedWallet } = useWalletState();

  // Ensure Solana wallet is selected for this app
  useEffect(() => {
    if (isConnected && wallet?.type !== "SOLANA") {
      // SDK now handles wallet selection internally
      // Just ensure SOLANA wallet type is selected
      setSelectedWallet({ id: "default", type: "SOLANA" });
    }
  }, [isConnected, wallet, setSelectedWallet]);

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <nav>
          {pathname !== "/" && (
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 px-4 py-2 rounded-none transition-colors">
              ← Back to Selector
            </Link>
          )}
        </nav>
        <div>
          {isConnected ? (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-gray-700 text-white rounded-none hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer">
              Connected: {wallet?.address?.slice(0, 6)}...
              {wallet?.address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium cursor-pointer">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
