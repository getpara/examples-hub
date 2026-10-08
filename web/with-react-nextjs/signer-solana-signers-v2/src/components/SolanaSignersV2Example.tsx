"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useSolanaWalletConnection } from "@/hooks/useSolanaWalletConnection";
import { SOLANA_DEVNET } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function SolanaSignersV2Example({ children }: { children: ReactNode }) {
  const wallet = useSolanaWalletConnection();
  const balance = useAccountBalance();
  const addressCopy = useCopyToClipboard();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
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

  if (!wallet.hasSolanaWallet) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          title="No Solana wallet"
          description="This account does not have a Solana wallet yet."
          network={SOLANA_DEVNET.networkLabel}>
          <Alert variant="warning" title="Enable Solana wallets">
            Turn on Solana wallets for your API key in the Para Developer Portal, then sign in again.
          </Alert>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()}>
            Open account
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
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
