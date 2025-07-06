"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal, useAccount, useWallet } from "@getpara/react-sdk";

export default function Header() {
  const pathname = usePathname();
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();

  const address = isConnected && wallet?.address 
    ? wallet.address 
    : null;

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
          {isConnected && address ? (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-green-700 text-white rounded-none hover:bg-green-800 transition-colors">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}