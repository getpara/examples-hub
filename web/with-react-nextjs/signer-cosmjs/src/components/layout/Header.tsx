"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useModal } from "@getpara/react-sdk";
import { useParaCosmjsProtoSigner } from "@getpara/react-sdk/cosmos";

export default function Header() {
  const pathname = usePathname();
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { protoSigner } = useParaCosmjsProtoSigner();

  const address = protoSigner?.address;

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
              data-testid="account-address-display"
              className="px-4 py-2 bg-gray-700 text-white rounded-none hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer">
              {address ? `${address.slice(0, 10)}...${address.slice(-4)}` : "Loading..."}
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
