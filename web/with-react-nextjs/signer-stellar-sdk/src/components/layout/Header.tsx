"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useModal, useWallet, useWalletState } from "@getpara/react-sdk";
import { useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();
  const { setSelectedWallet } = useWalletState();

  useEffect(() => {
    if (isConnected && wallet?.type !== "STELLAR") {
      // SDK now handles wallet selection internally
      // Just ensure STELLAR wallet type is selected
      setSelectedWallet({ id: "default", type: "STELLAR" });
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
          <button
            onClick={() => openModal()}
            data-testid={isConnected ? "account-address-display" : "header-connect-button"}
            data-address={wallet?.address || ""}
            className={`px-4 py-2 text-white rounded-none transition-colors text-sm font-medium cursor-pointer ${
              isConnected ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-900 hover:bg-gray-950"
            }`}>
            {isConnected
              ? `Connected: ${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
