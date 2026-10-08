"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Aside } from "@/components/ui/Aside";
import { BadgeList } from "@/components/ui/BadgeList";
import { Button } from "@/components/ui/Button";
import { Facts, type FactRow } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { UserCircleIcon } from "@/components/ui/UserCircleIcon";
import { useReownAppKitNetwork } from "@/hooks/useReownAppKitNetwork";
import { useReownAppKitWallet } from "@/hooks/useReownAppKitWallet";
import { useWagmiBalance } from "@/hooks/useWagmiBalance";
import { NETWORKS } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance } from "@/lib/format";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

const NETWORK_NAMES = NETWORKS.map((network) => network.name);

export function ReownAppKitExample() {
  const wallet = useReownAppKitWallet();
  const network = useReownAppKitNetwork();
  const balance = useWagmiBalance(wallet.address);
  const addressCopy = useCopyToClipboard();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
      onConnect={wallet.openAppKit}
      onOpenAccount={wallet.openAppKit}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          title="Connect a wallet"
          description="Open Reown AppKit and choose Para."
          network={network.networkName}>
          <Button size="lg" fullWidth onClick={wallet.openAppKit} data-testid="auth-connect-button">
            Connect wallet
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const formattedBalance = formatBalance(balance.balance, balance.symbol);
  const facts: FactRow[] = [
    { label: "Connector", value: wallet.connectorName ?? "Unknown" },
    { label: "Network", value: network.networkName },
    ...(formattedBalance ? [{ label: "Balance", value: formattedBalance, tone: "data" as const }] : []),
  ];

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={network.networkName}
        balance={formattedBalance}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      <Workbench
        aside={
          <Aside title="Networks">
            <BadgeList label="Supported networks" items={NETWORK_NAMES} hint="Switch networks from the AppKit account view." />
          </Aside>
        }>
        <ActionPanel
          title="Your wallet"
          api="useAppKit().open()"
          description="AppKit manages the connection and the account view. Para is one of its wallets, added as a wagmi connector."
          actions={
            <>
              <Button variant="outline" size="lg" icon={<UserCircleIcon className="size-icon-md" />} onClick={wallet.openAppKit}>
                Open account
              </Button>
              <Button
                variant="ghost"
                size="lg"
                icon={<Icon name="sign-out" className="size-icon-md" />}
                onClick={wallet.disconnectWallet}>
                Disconnect
              </Button>
            </>
          }>
          <Facts rows={facts} />
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
