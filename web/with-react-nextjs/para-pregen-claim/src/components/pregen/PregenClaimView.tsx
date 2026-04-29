import { Header } from "@/components/layout/Header";
import { ClaimPanel } from "@/components/pregen/panels/ClaimPanel";
import { ExportPrivateKeyPanel } from "@/components/pregen/panels/ExportPrivateKeyPanel";
import { GenerationPanel } from "@/components/pregen/panels/GenerationPanel";
import { WalletStatePanel } from "@/components/pregen/panels/WalletStatePanel";
import type { PregenWalletDraft } from "@/hooks/usePregenClaimFlow";

interface PregenClaimViewProps {
  email: string;
  setEmail: (email: string) => void;
  draft: PregenWalletDraft | null;
  error: string | null;
  isGenerating: boolean;
  isConnected: boolean;
  isLoading: boolean;
  connectedAddress: string;
  isClaimedWallet: boolean;
  exportError: string | null;
  exportStatus: string | null;
  isExportingPrivateKey: boolean;
  generateWallet: () => void;
  beginClaim: () => void;
  exportClaimedWalletPrivateKey: () => void;
}

export function PregenClaimView({
  email,
  setEmail,
  draft,
  error,
  isGenerating,
  isConnected,
  isLoading,
  connectedAddress,
  isClaimedWallet,
  exportError,
  exportStatus,
  isExportingPrivateKey,
  generateWallet,
  beginClaim,
  exportClaimedWalletPrivateKey,
}: PregenClaimViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        isConnected={isConnected}
        address={connectedAddress}
        canClaim={!!draft}
        onConnect={beginClaim}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pregen wallet claim</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create a wallet with an app-owned UUID, store the app's email mapping, then let the provider callback upgrade the identifier before Para claims it during auth.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <GenerationPanel
              email={email}
              draft={draft}
              error={error}
              isGenerating={isGenerating}
              isConnected={isConnected}
              onEmailChange={setEmail}
              onGenerate={generateWallet}
            />
            <ClaimPanel
              draft={draft}
              isConnected={isConnected}
              isLoading={isLoading}
              onClaim={beginClaim}
            />
            <ExportPrivateKeyPanel
              exportError={exportError}
              exportStatus={exportStatus}
              isClaimedWallet={isClaimedWallet}
              isExportingPrivateKey={isExportingPrivateKey}
              onExportPrivateKey={exportClaimedWalletPrivateKey}
            />
          </div>

          <WalletStatePanel
            draft={draft}
            connectedAddress={connectedAddress}
            isConnected={isConnected}
            isClaimedWallet={isClaimedWallet}
          />
        </div>
      </main>
    </div>
  );
}
