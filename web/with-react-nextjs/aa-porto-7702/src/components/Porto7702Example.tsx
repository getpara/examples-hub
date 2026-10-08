"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useParaViemSigner } from "@/hooks/useParaViemSigner";
import { usePortoKeys } from "@/hooks/usePortoKeys";
import { usePortoUpgrade } from "@/hooks/usePortoUpgrade";
import { BASE_SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage, shortenAddress } from "@/lib/format";
import { PORTO_RELAY_LABEL } from "@/lib/porto";
import { countKeysByRole } from "@/lib/portoKeys";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function Porto7702Example() {
  const wallet = useParaModalWallet();
  const balance = useAccountBalance();
  const signer = useParaViemSigner();
  const signerAddress = wallet.isConnected ? signer.address : null;
  const upgrade = usePortoUpgrade(signerAddress);
  const portoKeys = usePortoKeys(signerAddress, upgrade.isUpgraded);
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
          title="Upgrade your EOA"
          description="Connect with Para to delegate smart account behavior to your EOA with Porto."
          network={BASE_SEPOLIA.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const keys = portoKeys.keys;
  const isChecking = signer.isLoading || portoKeys.isChecking;
  const isUpgraded = upgrade.isUpgraded || keys.length > 0;
  const shortAddress = shortenAddress(wallet.address);

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        addressLabel={isUpgraded ? "Porto account" : "Para EOA"}
        addressBadge={isUpgraded ? "EIP-7702" : undefined}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={BASE_SEPOLIA.name}
        balance={formatBalance(balance.balance, BASE_SEPOLIA.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      <Workbench
        aside={
          <Aside
            title="Account"
            status={
              isChecking ? (
                <Badge>Checking</Badge>
              ) : isUpgraded ? (
                <Badge variant="success">Upgraded</Badge>
              ) : (
                <Badge>Ready</Badge>
              )
            }>
            <Facts
              rows={[
                { label: "Para EOA", value: shortAddress, tone: "mono", title: wallet.address },
                {
                  label: "Porto account",
                  value: isChecking ? "Checking…" : shortAddress,
                  tone: "mono",
                  title: isChecking ? undefined : wallet.address,
                },
                { label: "Chain", value: BASE_SEPOLIA.name },
                { label: "Relay", value: PORTO_RELAY_LABEL, tone: "mono" },
                { label: "Admin keys", value: countKeysByRole(keys, "admin"), tone: "data" },
                { label: "Session keys", value: countKeysByRole(keys, "session"), tone: "data" },
              ]}
            />
          </Aside>
        }>
        <ActionPanel
          title="Upgrade to Porto"
          api="usePortoSmartAccount({ chain })"
          description="Authorize the Para wallet as a Porto admin key and upgrade the connected EOA in place. The address stays the same."
          actions={
            <Button
              size="lg"
              isLoading={upgrade.isPending}
              disabled={isChecking || isUpgraded || !signer.address}
              icon={isUpgraded ? <Icon name="check" className="size-icon-md" /> : undefined}
              onClick={upgrade.upgrade}
              data-testid="upgrade-account-button">
              {isUpgraded ? "Porto account active" : "Upgrade to Porto"}
            </Button>
          }>
          {upgrade.errorMessage && (
            <Alert variant="destructive" title="Upgrade failed">
              {formatErrorMessage(upgrade.errorMessage)}
            </Alert>
          )}
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
