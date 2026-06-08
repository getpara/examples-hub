import { StatusBanner } from "@/components/pregen/ui/StatusBanner";

interface ExportPrivateKeyPanelProps {
  exportError: string | null;
  exportStatus: string | null;
  isClaimedWallet: boolean;
  isExportingPrivateKey: boolean;
  onExportPrivateKey: () => void;
}

export function ExportPrivateKeyPanel({
  exportError,
  exportStatus,
  isClaimedWallet,
  isExportingPrivateKey,
  onExportPrivateKey,
}: ExportPrivateKeyPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm animate-fade-in-up-delayed">
      <div className="border-b border-border/60 px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Key export</p>
        <h2 className="mt-1 text-base font-semibold text-card-foreground">Export claimed wallet key</h2>
      </div>

      <div className="space-y-4 p-6">
        {exportStatus && <StatusBanner tone="success" message={exportStatus} />}
        {exportError && <StatusBanner tone="error" message={exportError} />}

        <button
          type="button"
          onClick={onExportPrivateKey}
          data-testid="export-private-key-button"
          disabled={!isClaimedWallet || isExportingPrivateKey}
          className="btn-primary w-full px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {isExportingPrivateKey ? "Opening export..." : "Export private key"}
        </button>
      </div>
    </section>
  );
}
