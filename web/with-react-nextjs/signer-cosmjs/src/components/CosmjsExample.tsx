"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useCosmosWalletConnection } from "@/hooks/useCosmosWalletConnection";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function CosmjsExample({ children }: { children: ReactNode }) {
  const wallet = useCosmosWalletConnection();
  const balance = useAccountBalance(wallet.address);
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
          network={ICS_PROVIDER_TESTNET.networkLabel}>
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
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={ICS_PROVIDER_TESTNET.name}
        balance={formatBalance(balance.balance, ICS_PROVIDER_TESTNET.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      {children}
    </AppShell>
  );
}
