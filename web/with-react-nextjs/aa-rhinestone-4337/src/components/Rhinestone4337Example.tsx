"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { BadgeList } from "@/components/ui/BadgeList";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { SmartAccountCell } from "@/components/ui/SmartAccountCell";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useRhinestoneAccount } from "@/hooks/useRhinestoneAccount";
import { NETWORK, SUPPORTED_CHAIN_NAMES } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatErrorMessage, shortenAddress } from "@/lib/format";
import { formatTokenCount } from "@/lib/portfolio";
import { ACCOUNT_STANDARD } from "@/lib/rhinestone";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function Rhinestone4337Example() {
  const wallet = useParaModalWallet();
  const rhinestone = useRhinestoneAccount({ enabled: wallet.isConnected });
  const portfolio = usePortfolio(rhinestone.account);
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

  const footer = (
    <ExampleFooter
      docsHref={EXAMPLE.docsHref}
      sourceHref={EXAMPLE.sourceHref}
      note="Read only. No funds move."
    />
  );

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          title="Create a global wallet"
          description="Connect with Para to create a Rhinestone EIP-4337 account for multichain execution."
          network={NETWORK.label}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const accountValue = rhinestone.isLoading ? "Creating…" : (rhinestone.address ?? "Not created");

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        addressLabel="Para signer"
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={NETWORK.summary}
        networkLabel="Networks"
        balance={formatTokenCount(portfolio.tokenCount)}
        balanceLabel="Portfolio"
        isBalanceLoading={portfolio.isLoading}
        isBalanceRefreshing={portfolio.isRefreshing}
        onRefreshBalance={rhinestone.account ? portfolio.refresh : undefined}>
        <SmartAccountCell
          address={rhinestone.address}
          label="Rhinestone account"
          standard={ACCOUNT_STANDARD}
          isLoading={rhinestone.isLoading}
          unavailableLabel="Not created"
        />
      </AccountStrip>
      <Workbench
        aside={
          <Aside title="Global wallet">
            <Facts
              rows={[
                {
                  label: "Para signer",
                  value: shortenAddress(wallet.address),
                  tone: "mono",
                  title: wallet.address,
                },
                { label: "Rhinestone account", value: accountValue, tone: "mono" },
                { label: "Standard", value: ACCOUNT_STANDARD },
                {
                  label: "Tokens",
                  value: portfolio.tokenCount === null ? "Not loaded" : portfolio.tokenCount,
                  tone: "data",
                },
              ]}
            />
          </Aside>
        }>
        <ActionPanel
          title="Portfolio"
          api="account.getPortfolio()"
          description="Rhinestone returns balances for the supported chain set."
          actions={
            <Button
              size="lg"
              isLoading={portfolio.isLoading || portfolio.isRefreshing}
              disabled={!rhinestone.account}
              onClick={portfolio.refresh}
              icon={<Icon name="refresh" className="size-icon-md" />}
              data-testid="refresh-portfolio-button">
              Refresh portfolio
            </Button>
          }>
          <BadgeList label="Supported chains" items={SUPPORTED_CHAIN_NAMES} />
          {rhinestone.errorMessage && (
            <Alert variant="destructive" title="Account not created">
              {formatErrorMessage(rhinestone.errorMessage)}
            </Alert>
          )}
          {portfolio.errorMessage && (
            <Alert variant="destructive" title="Portfolio not loaded">
              {formatErrorMessage(portfolio.errorMessage)}
            </Alert>
          )}
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
