"use client";

import { useModal } from "@/context/ModalContext";
import { useParaAccount } from "@/hooks/useParaAccount";
import { formatAddress } from "@/utils/format";

export function Header() {
  const { openModal } = useModal();
  const { isConnected, address } = useParaAccount();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Para Phone Auth</h1>
        <button
          onClick={openModal}
          className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-none hover:bg-gray-900 transition-colors">
          {isConnected ? formatAddress(address) : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}