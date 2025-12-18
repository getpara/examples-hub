"use client";

import { useModal, useWallet } from "@getpara/react-sdk";
import { useGlobalWallet } from "@/hooks/useGlobalWallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, LogOut } from "lucide-react";
import { useState } from "react";

export function WalletSidebar() {
  const { openModal } = useModal();
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useWallet();
  const { address, isConnected, accountAddress, portfolio } = useGlobalWallet();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get chain ID - default to Arbitrum
  const chainId = 42161;

  // Chain ID to name mapping
  const getChainName = (chainId: number): string => {
    const chainNames: { [key: number]: string } = {
      1: "Ethereum",
      42161: "Arbitrum",
      8453: "Base",
      137: "Polygon",
      10: "Optimism",
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">Wallet</h2>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Connect your wallet to get started
          </p>
          <Button
            onClick={async () => {
              try {
                await openModal();
              } catch (error) {
                console.error("Failed to open Para modal:", error);
              }
            }}
            className="w-full"
            size="lg"
            disabled={walletLoading}
          >
            {walletLoading ? "Loading..." : "Connect Wallet"}
          </Button>

          {/* Debug info */}
          <div className="text-xs text-slate-500 mt-2 space-y-1">
            <p>Has Wallet: {wallet ? "Yes" : "No"}</p>
            <p>Wallet Loading: {walletLoading ? "Yes" : "No"}</p>
            {walletError && (
              <p className="text-red-500">Error: {String(walletError)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connection Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-900">
                Connected
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {getChainName(chainId)}
            </Badge>
          </div>

          {/* Connected Address */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Connected Address</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-slate-100 p-2 rounded border break-all flex-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(address || "", "connected")}
                className="h-8 w-8 p-0"
              >
                {copiedAddress === "connected" ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Global Wallet Address */}
          {accountAddress && (
            <div>
              <p className="text-xs text-slate-500 mb-1">
                Global Wallet Address
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-blue-50 p-2 rounded border break-all flex-1">
                  {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(accountAddress, "global")}
                  className="h-8 w-8 p-0"
                >
                  {copiedAddress === "global" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Works on all chains</p>
            </div>
          )}

          {/* Portfolio Summary */}
          {portfolio.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Portfolio</p>
              <div className="space-y-2">
                {portfolio.map((token, index) => (
                  <div key={index} className="bg-slate-100 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold text-green-700">
                          {token.totalBalance}
                        </span>
                        <p className="text-xs text-slate-500">Available</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-600">Locked:</span>
                        <span className="font-mono">{token.lockedBalance}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {token.chains.length} chain
                      {token.chains.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button
              onClick={() => openModal()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Manage Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
