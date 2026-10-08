"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { AsideHeading } from "@/components/ui/AsideHeading";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { FlushPanel } from "@/components/ui/FlushPanel";
import { KeyIcon } from "@/components/ui/KeyIcon";
import { StepList } from "@/components/ui/StepList";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useExportWalletKey } from "@/hooks/useExportWalletKey";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { usePregenWallet } from "@/hooks/usePregenWallet";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getClaimFacts, getClaimSteps, getWalletStateFacts, isSameAddress } from "@/lib/pregenClaim";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useStepProgress } from "@/lib/useStepProgress";

export function PregenClaimExample() {
  const account = useParaModalWallet();
  const pregen = usePregenWallet();
  const keyExport = useExportWalletKey();
  const balance = useAccountBalance();
  const addressCopy = useCopyToClipboard();

  const wallet = pregen.wallet;
  const isClaimed = wallet !== null && isSameAddress(wallet.walletAddress, account.address);
  const isClaiming = wallet !== null && !account.isConnected && account.isModalOpen;
  const progress = useStepProgress(getClaimSteps({ wallet, isClaimed, isExportOpened: keyExport.isOpened }), {
    upcoming: "Next",
  });
  const createErrorMessage = formatErrorMessage(pregen.errorMessage);
  const exportErrorMessage = formatErrorMessage(keyExport.errorMessage);

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={account.isConnected}
      address={account.address}
      isConnecting={isClaiming}
      onConnect={wallet ? () => account.openModal() : undefined}
      onOpenAccount={() => account.openModal()}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  return (
    <AppShell header={header} footer={footer}>
      {account.isConnected && (
        <AccountStrip
          address={account.address}
          onCopyAddress={() => addressCopy.copy(account.address)}
          addressCopyStatus={addressCopy.status}
          network={SEPOLIA.name}
          balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
          isBalanceLoading={balance.isLoading}
          isBalanceRefreshing={balance.isRefreshing}
          onRefreshBalance={balance.refresh}
        />
      )}
      <Workbench
        aside={
          <Aside title="Wallet state">
            <AsideHeading>{account.isConnected ? "Connected wallet" : "Awaiting claim"}</AsideHeading>
            <Facts rows={getWalletStateFacts({ wallet, connectedAddress: account.address, isClaimed })} />
          </Aside>
        }>
        <FlushPanel>
          <StepList steps={progress.items} label="Claim steps" />
        </FlushPanel>
        {progress.currentIndex === 0 && (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void pregen.create();
            }}>
            <ActionPanel
              title="Create a pregen wallet"
              api="POST /api/wallet/generate"
              description="Your server creates a wallet identified by a UUID before the user signs up, and maps it to the email the user will claim with."
              hint={account.isConnected ? "Sign out to create a pregen wallet for a new user." : undefined}
              actions={
                <Button
                  type="submit"
                  size="lg"
                  isLoading={pregen.isCreating}
                  disabled={!pregen.email || account.isConnected}
                  data-testid="generate-pregen-button">
                  Create pregen wallet
                </Button>
              }>
              <TextField
                label="App email mapping"
                type="email"
                placeholder="claimant@example.com"
                value={pregen.email}
                onChange={(event) => pregen.setEmail(event.target.value)}
                disabled={pregen.isCreating || account.isConnected}
                data-testid="pregen-email-input"
              />
              {createErrorMessage && (
                <Alert variant="destructive" title="Wallet not created">
                  {createErrorMessage}
                </Alert>
              )}
            </ActionPanel>
          </form>
        )}
        {progress.currentIndex === 1 && wallet && (
          <ActionPanel
            title="Claim the wallet"
            api="updatePregenWalletIdentifier()"
            description="The user signs in with the mapped email. Your server moves the wallet from the UUID to that email, and the user owns it from then on."
            hint={
              isClaiming
                ? "Finish signing in with Para."
                : account.isConnected
                  ? "This account is not the pregen wallet. Sign out and sign in with the claim email."
                  : undefined
            }
            actions={
              <Button
                size="lg"
                isLoading={isClaiming}
                disabled={account.isConnected || account.isLoading}
                onClick={() => account.openModal()}
                data-testid="claim-pregen-button">
                Begin claim
              </Button>
            }>
            <Facts rows={getClaimFacts(wallet)} />
          </ActionPanel>
        )}
        {progress.currentIndex === 2 && wallet && (
          <ActionPanel
            title="Export the key"
            api="exportPrivateKeyAsync({ walletId })"
            description="The claimed wallet belongs to the user. Export opens Para in a pop-up so they can take the key with them."
            actions={
              <Button
                variant="outline"
                size="lg"
                icon={<KeyIcon className="size-icon-md" />}
                isLoading={keyExport.isPending}
                onClick={() => void keyExport.exportKey(wallet.walletId)}
                data-testid="export-private-key-button">
                Export private key
              </Button>
            }>
            <Alert variant="success" title="Pregen wallet claimed.">
              The connected address matches the pregen wallet.
            </Alert>
            {keyExport.isOpened && (
              <Alert variant="info" title="Export flow opened.">
                Finish in the Para pop-up.
              </Alert>
            )}
            {exportErrorMessage && (
              <Alert variant="destructive" title="Export failed">
                {exportErrorMessage}
              </Alert>
            )}
          </ActionPanel>
        )}
      </Workbench>
    </AppShell>
  );
}
