"use client";

import { useConnect, useDisconnect, useAccount } from "wagmi";
import { Modal } from "./ui/Modal";
import { useEffect } from "react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, connectors, isSuccess } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address, connector: activeConnector } = useAccount();

  const paraConnector = connectors.find((connector) => connector.id === "para");
  const otherConnectors = connectors.filter((connector) => connector.id !== "para");

  // Close modal on successful connection
  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess, onClose]);

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">{isConnected ? "Wallet Settings" : "Connect Wallet"}</h2>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-none border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Connected with {activeConnector?.name}</p>
              <p className="text-sm font-mono text-gray-900">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Social Login Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Social Login</h3>
              {paraConnector && (
                <button
                  onClick={() => connect({ connector: paraConnector })}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors cursor-pointer"
                >
                  Connect with {paraConnector.name}
                </button>
              )}
            </div>

            {/* Other Wallets Section */}
            {otherConnectors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Other Wallets</h3>
                <div className="space-y-2">
                  {otherConnectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => connect({ connector })}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-none hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Connect with {connector.name}
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