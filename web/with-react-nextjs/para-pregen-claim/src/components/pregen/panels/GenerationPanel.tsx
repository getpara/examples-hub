import { StatusBanner } from "@/components/pregen/ui/StatusBanner";
import type { PregenWalletDraft } from "@/hooks/usePregenClaimFlow";

interface GenerationPanelProps {
  email: string;
  draft: PregenWalletDraft | null;
  error: string | null;
  isGenerating: boolean;
  isConnected: boolean;
  onEmailChange: (email: string) => void;
  onGenerate: () => void;
}

export function GenerationPanel({
  email,
  draft,
  error,
  isGenerating,
  isConnected,
  onEmailChange,
  onGenerate,
}: GenerationPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm animate-fade-in-up">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">App pregen</p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Create UUID-identified wallet</h2>
      </div>

      <div className="space-y-4 p-6">
        {error && <StatusBanner tone="error" message={error} />}

        <div>
          <label htmlFor="claim-email" className="mb-2 block text-sm font-medium text-card-foreground">
            App email mapping
          </label>
          <input
            id="claim-email"
            data-testid="pregen-email-input"
            type="email"
            value={email}
            onChange={event => onEmailChange(event.target.value)}
            placeholder="claimant@example.com"
            disabled={isGenerating || isConnected || !!draft}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted"
          />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            The Para pregen identifier is a generated UUID. This email is stored by the app so the later login can find and claim that wallet.
          </p>
        </div>

        <button
          onClick={onGenerate}
          data-testid="generate-pregen-button"
          disabled={!email || isGenerating || isConnected || !!draft}
          className="btn-primary w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isGenerating ? "Creating..." : "Create pregen wallet"}
        </button>

        {draft && (
          <div className="space-y-3 rounded-lg border border-success/20 bg-success/8 p-4 animate-fade-in">
            <IdentifierRow label="UUID identifier" value={draft.customId} testId="generated-custom-id" />
            <IdentifierRow label="Wallet ID" value={draft.walletId} testId="generated-wallet-id" />
            <IdentifierRow
              label="Wallet address"
              value={draft.walletAddress || "Pending address"}
              testId="generated-wallet-address"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function IdentifierRow({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p data-testid={testId} className="mt-1 break-all font-mono text-xs leading-relaxed text-card-foreground">
        {value}
      </p>
    </div>
  );
}
