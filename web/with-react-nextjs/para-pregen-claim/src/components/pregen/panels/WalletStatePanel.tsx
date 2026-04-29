import { StatusBanner } from "@/components/pregen/ui/StatusBanner";
import type { PregenWalletDraft } from "@/hooks/usePregenClaimFlow";

interface WalletStatePanelProps {
  draft: PregenWalletDraft | null;
  connectedAddress: string;
  isConnected: boolean;
  isClaimedWallet: boolean;
}

export function WalletStatePanel({
  draft,
  connectedAddress,
  isConnected,
  isClaimedWallet,
}: WalletStatePanelProps) {
  return (
    <aside className="rounded-lg border border-border bg-card shadow-sm animate-fade-in-up lg:sticky lg:top-20 lg:self-start">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Wallet state</p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">
          {isConnected ? "Connected wallet" : "Awaiting claim"}
        </h2>
      </div>

      <div className="space-y-4 p-6">
        {isClaimedWallet && <StatusBanner tone="success" message="Pregen wallet claimed." />}

        <StateRow label="Expected address" value={draft?.walletAddress || "No pregen wallet"} testId="expected-wallet-address" />
        <StateRow label="Connected address" value={connectedAddress || "Not connected"} testId="connected-wallet-address" />
        <StateRow label="Claim email" value={draft?.email || "Not set"} testId="claim-wallet-email" />
      </div>
    </aside>
  );
}

function StateRow({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p data-testid={testId} className="mt-1 break-all font-mono text-xs leading-relaxed text-card-foreground">
        {value}
      </p>
    </div>
  );
}
