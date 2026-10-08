"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { AccountStripWithTestIds } from "@/components/ui/AccountStripWithTestIds";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useStellarWalletConnection } from "@/hooks/useStellarWalletConnection";
import { STELLAR_TESTNET } from "@/lib/chain";
import { formatXlmBalance } from "@/lib/display";
import { EXAMPLE } from "@/lib/example";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function StellarSdkExample({ children }: { children: ReactNode }) {
  const wallet = useStellarWalletConnection();
  const signer = useParaSigner();
  const balance = useAccountBalance(signer.address ?? "");
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
          network={STELLAR_TESTNET.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <AccountStripWithTestIds
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={STELLAR_TESTNET.name}
        balance={formatXlmBalance(balance.balance)}
        balanceTestId="stellar-balance"
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      {children}
    </AppShell>
  );
}
