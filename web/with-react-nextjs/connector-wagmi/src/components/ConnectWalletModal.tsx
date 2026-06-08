"use client";

import { Modal } from "./ui/Modal";
import type { WalletConnectorOption } from "@/hooks/useWagmiWalletConnection";
import { truncateAddress } from "@/utils/format";

interface ConnectWalletModalProps {
  activeConnectorName?: string;
  address?: string;
  connectors: WalletConnectorOption[];
  isConnected: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connectorId: string) => void;
  onDisconnect: () => void;
}

export function ConnectWalletModal({
  activeConnectorName,
  address,
  connectors,
  isConnected,
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
}: ConnectWalletModalProps) {
  const paraConnectors = connectors.filter((connector) => connector.isPara);
  const otherConnectors = connectors.filter((connector) => !connector.isPara);

  return (
    <Modal isOpen={isOpen} onClose={onClose} data-testid="auth-modal">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-card-foreground">
          {isConnected ? "Wallet Settings" : "Connect Wallet"}
        </h2>

        {isConnected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/60 px-4 py-3">
              <p className="mb-1 text-sm text-muted-foreground">Connected with {activeConnectorName}</p>
              <p className="font-mono text-sm text-card-foreground">{address ? truncateAddress(address) : ""}</p>
            </div>
            <button
              type="button"
              onClick={onDisconnect}
              data-testid="auth-logout-button"
              className="w-full rounded-lg border border-destructive/15 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/12">
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Social Login</h3>
              {paraConnectors.map((connector) => (
                <button
                  key={connector.id}
                  type="button"
                  onClick={() => onConnect(connector.id)}
                  data-testid="auth-oauth-para"
                  className="btn-primary w-full px-4 py-3">
                  Connect with {connector.name}
                </button>
              ))}
            </div>

            {otherConnectors.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Other Wallets</h3>
                <div className="space-y-2">
                  {otherConnectors.map((connector) => (
                    <button
                      key={connector.id}
                      type="button"
                      onClick={() => onConnect(connector.id)}
                      data-testid={`wallet-option-${connector.id}`}
                      className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted">
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
