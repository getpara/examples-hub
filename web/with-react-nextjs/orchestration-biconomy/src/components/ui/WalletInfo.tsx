"use client";

import { useState } from "react";
import { useWallet, useModal } from "@getpara/react-sdk";
import { formatUnits } from "viem";
import { Copy, Check } from "lucide-react";
import { USDC_DECIMALS } from "@/lib/biconomy";

interface WalletInfoProps {
  balance: bigint | null;
  isMeeReady: boolean;
  isMeeLoading: boolean;
  meeError: Error | null;
}

export function WalletInfo({ balance, isMeeReady, isMeeLoading, meeError }: WalletInfoProps) {
  const { data: wallet } = useWallet();
  const { openModal } = useModal();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!wallet?.address) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Wallet Balance</h3>
        <button
          onClick={() => openModal()}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
          Manage
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {balance !== null ? formatUnits(balance, USDC_DECIMALS) : "0.00"}
          </span>
          <span className="text-lg text-gray-500">USDC</span>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">Wallet Address</span>
          <button
            onClick={copyAddress}
            className="flex items-center gap-1.5 text-sm font-mono text-gray-700 hover:text-gray-900 transition-colors">
            {wallet?.address?.slice(0, 6)}...{wallet?.address?.slice(-4)}
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">Network</span>
          <span className="text-sm font-medium text-gray-700">Base Mainnet</span>
        </div>
      </div>

      {isMeeLoading && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">Initializing Biconomy MEE...</p>
        </div>
      )}

      {meeError && (
        <div className="px-6 py-3 border-t border-gray-200 bg-red-50">
          <p className="text-sm text-red-600 break-words">{meeError.message}</p>
        </div>
      )}

      {isMeeReady && !isMeeLoading && !meeError && (
        <div className="px-6 py-3 border-t border-gray-200 bg-green-50">
          <p className="text-sm text-green-700">Biconomy MEE ready • Gas fees paid in USDC</p>
        </div>
      )}
    </div>
  );
}

