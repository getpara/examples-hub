import type { PregenWalletDraft } from "@/hooks/usePregenClaimFlow";

interface ClaimPanelProps {
  draft: PregenWalletDraft | null;
  isConnected: boolean;
  isLoading: boolean;
  onClaim: () => void;
}

export function ClaimPanel({ draft, isConnected, isLoading, onClaim }: ClaimPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm animate-fade-in-up-delayed">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">User claim</p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Upgrade UUID to email and authenticate</h2>
      </div>

      <div className="space-y-4 p-6">
        <div className="rounded-lg bg-muted/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">Email used for identifier upgrade</p>
          <p data-testid="claim-email-display" className="mt-1 break-all font-mono text-sm text-card-foreground">
            {draft?.email ?? "Create a pregen wallet first"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClaim}
          data-testid="claim-pregen-button"
          disabled={!draft || isConnected || isLoading}
          className="btn-primary w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isLoading ? "Preparing..." : "Begin claim"}
        </button>
      </div>
    </section>
  );
}
