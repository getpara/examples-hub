"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";
import { SOLANA_DEVNET } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function SolanaAnchorExample({ children }: { children: ReactNode }) {
  const wallet = useSolanaWalletConnection();
  const signer = useParaSigner();
  const solanaAddress = signer.address ?? wallet.address;
  const balance = useAccountBalance(signer.address ?? "");
  const addressCopy = useCopyToClipboard();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={solanaAddress}
      onConnect={wallet.openModal}
      onOpenAccount={wallet.openModal}
    />
  );
  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          description="Connect to continue. Your wallet is created the first time you sign in."
          network={SOLANA_DEVNET.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={solanaAddress}
        onCopyAddress={() => addressCopy.copy(solanaAddress)}
        addressCopyStatus={addressCopy.status}
        network={SOLANA_DEVNET.name}
        balance={formatBalance(balance.balance, SOLANA_DEVNET.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      {children}
    </AppShell>
  );
}
