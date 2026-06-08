import type { WalletType } from "graz";
import { Modal } from "@/components/ui/Modal";
import type { WalletOption } from "@/hooks/useGrazWalletConnection";
import { truncateAddress } from "@/utils/format";

interface ConnectWalletModalProps {
  isOpen: boolean;
  isConnected: boolean;
  connectedAddress: string;
  paraWallet: WalletOption | null;
  otherWallets: WalletOption[];
  connectStatus: string;
  connectError: Error | null;
  isDisconnecting: boolean;
  onConnect: (walletType: WalletType) => void;
  onDisconnect: () => void;
  onClose: () => void;
}

export function ConnectWalletModal({
  isOpen,
  isConnected,
  connectedAddress,
  paraWallet,
  otherWallets,
  connectStatus,
  connectError,
  isDisconnecting,
  onConnect,
  onDisconnect,
  onClose,
}: ConnectWalletModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} data-testid="auth-modal">
      <div className="p-6">
        <h2 className="text-sm font-semibold mb-1">
          {isConnected ? "Wallet Settings" : "Connect Wallet"}
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          {isConnected
            ? "Manage the Cosmos wallet connected through Graz."
            : "Choose Para or another available Cosmos wallet."}
        </p>

        {isConnected ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Connected Address</p>
              <p className="text-sm font-mono break-all">
                {truncateAddress(connectedAddress, 10, 8)}
              </p>
            </div>
            <button
              type="button"
              onClick={onDisconnect}
              data-testid="auth-logout-button"
              disabled={isDisconnecting}
              className="w-full rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/12 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Para</p>
              {paraWallet ? (
                <button
                  type="button"
                  onClick={() => onConnect(paraWallet.walletType)}
                  data-testid="auth-oauth-para"
                  className="btn-primary w-full px-4 py-2.5 text-sm">
                  Connect with {paraWallet.name}
                </button>
              ) : (
                <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3">
                  <p className="text-sm text-muted-foreground">Para is not available in this browser.</p>
                </div>
              )}
            </div>

            {otherWallets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Other Wallets</p>
                <div className="space-y-2">
                  {otherWallets.map((wallet) => (
                    <button
                      type="button"
                      key={wallet.walletType}
                      onClick={() => onConnect(wallet.walletType)}
                      data-testid={`wallet-option-${wallet.walletType}`}
                      className="btn-secondary w-full px-4 py-2.5 text-sm">
                      Connect with {wallet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {connectStatus === "pending" && (
              <div className="rounded-xl bg-muted/60 border border-border/60 px-4 py-3 animate-fade-in">
                <p className="text-sm text-muted-foreground">Opening wallet connection...</p>
              </div>
            )}

            {connectError && (
              <div className="rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in">
                <p className="text-sm text-destructive break-words">
                  {connectError.message || "Wallet connection failed."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
