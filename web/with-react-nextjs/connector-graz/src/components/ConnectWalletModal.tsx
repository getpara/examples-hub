"use client";

import { useConnect, useDisconnect, useAccount, getAvailableWallets, WalletType } from "graz";
import { Modal } from "./ui/Modal";
import { useEffect } from "react";
import { cosmosicsprovidertestnet } from "graz/chains";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, status } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: account, isConnected } = useAccount();
  const availableWallets = getAvailableWallets();
  const wallets = Object.entries(availableWallets)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => ({
      walletType: walletType as WalletType,
      name: walletType
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));

  const paraWallet = wallets.find((wallet) => wallet.walletType === WalletType.PARA);
  const otherWallets = wallets.filter((wallet) => wallet.walletType !== WalletType.PARA);

  // Close modal on successful connection
  useEffect(() => {
    if (status === "success") {
      onClose();
    }
  }, [status, onClose]);

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      data-testid="auth-modal">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">{isConnected ? "Wallet Settings" : "Connect Wallet"}</h2>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-none border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Connected</p>
              <p className="text-sm font-mono text-gray-900">
                {account?.bech32Address?.slice(0, 6)}...{account?.bech32Address?.slice(-4)}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              data-testid="auth-logout-button"
              className="w-full px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors cursor-pointer">
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Social Login Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Social Login</h3>
              {paraWallet && (
                <button
                  onClick={() =>
                    connect({ walletType: paraWallet.walletType, chainId: cosmosicsprovidertestnet.chainId })
                  }
                  data-testid="auth-oauth-para"
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors cursor-pointer">
                  Connect with {paraWallet.name}
                </button>
              )}
            </div>

            {/* Other Wallets Section */}
            {otherWallets.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Other Wallets</h3>
                <div className="space-y-2">
                  {otherWallets.map((wallet) => (
                    <button
                      key={wallet.walletType}
                      onClick={() =>
                        connect({ walletType: wallet.walletType, chainId: cosmosicsprovidertestnet.chainId })
                      }
                      data-testid={`wallet-option-${wallet.walletType}`}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-none hover:bg-gray-200 transition-colors cursor-pointer">
                      Connect with {wallet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
