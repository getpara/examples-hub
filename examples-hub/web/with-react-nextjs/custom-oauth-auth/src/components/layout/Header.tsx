"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useParaAccount } from "@/hooks/useParaAccount";

interface HeaderProps {
  onConnectClick: () => void;
}

export default function Header({ onConnectClick }: HeaderProps) {
  const pathname = usePathname();
  const { address, isConnected } = useParaAccount();

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
              onClick={onConnectClick}
              className="px-4 py-2 bg-gray-700 text-white rounded-none hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer">
              Connected: {address?.slice(0, 6)}...
              {address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={onConnectClick}
              className="px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors text-sm font-medium cursor-pointer">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}