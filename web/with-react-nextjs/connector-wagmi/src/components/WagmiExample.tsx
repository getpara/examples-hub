"use client";

import { useCallback, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountMenu } from "@/components/ui/AccountMenu";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { PickerIcon } from "@/components/ui/PickerIcon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { TextField } from "@/components/ui/TextField";
import { WalletPicker, type WalletPickerOption } from "@/components/ui/WalletPicker";
import { useWagmiBalance } from "@/hooks/useWagmiBalance";
import { useWagmiEthTransfer } from "@/hooks/useWagmiEthTransfer";
import { useWagmiWalletConnection } from "@/hooks/useWagmiWalletConnection";
import { explorerAddressUrl, explorerTxUrl, SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useTransferForm } from "@/lib/useTransferForm";

export function WagmiExample() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);
  const wallet = useWagmiWalletConnection({ onConnectSuccess: closePicker });
  const accountMenu = useAccountMenu(wallet.isConnected);
  const balance = useWagmiBalance(wallet.address);
  const transfer = useWagmiEthTransfer();
  const form = useTransferForm(transfer.send);
  const addressCopy = useCopyToClipboard();
  const hashCopy = useCopyToClipboard();
  const address = wallet.address ?? "";

  const walletOptions: WalletPickerOption[] = [...wallet.connectors]
    .sort((first, second) => Number(second.isPara) - Number(first.isPara))
    .map((connector) =>
      connector.isPara
        ? {
            id: connector.id,
            name: connector.name,
            description: "Email, phone, passkey, or social",
            connectingDescription: "Continue in the Para window",
            mark: <PickerIcon name="para-mark" className="size-6" />,
            testId: "auth-oauth-para",
          }
        : {
            id: connector.id,
            name: connector.name,
            description: "Detected in this browser",
            mark: <PickerIcon name="globe-simple" className="size-6" />,
            testId: `wallet-option-${connector.id}`,
          }
    );

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={address}
      isConnecting={wallet.isConnecting}
      onConnect={() => setIsPickerOpen(true)}
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <WalletPicker
          isOpen={isPickerOpen}
          onClose={closePicker}
          options={walletOptions}
          onSelect={wallet.connectWallet}
          connectingId={wallet.connectingConnectorId}
          testId="auth-modal"
          closeTestId="modal-close-button"
        />
        <SignInPanel
          title="Connect a wallet"
          description="Choose Para or another wallet to send Sepolia ETH."
          network={SEPOLIA.networkLabel}>
          <Button size="lg" fullWidth onClick={() => setIsPickerOpen(true)} data-testid="auth-connect-button">
            Connect wallet
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const isTransferPending = transfer.isSending || transfer.isConfirming;

  return (
    <AppShell header={header} footer={footer}>
      <AccountMenu
        isOpen={accountMenu.isOpen}
        onClose={accountMenu.close}
        address={address}
        connectionLabel={`Connected with ${wallet.activeConnectorName ?? "wagmi"}`}
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        explorerHref={explorerAddressUrl(address)}
        explorerLabel={`View on ${SEPOLIA.explorerName}`}
        onDisconnect={() => wallet.disconnectWallet()}
        disconnectTestId="auth-logout-button"
      />
      <AccountStrip
        address={address}
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}
        balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      <Workbench
        aside={
          <ResultPanel
            status={getResultStatus({
              isPending: isTransferPending,
              errorMessage: transfer.errorMessage,
              value: transfer.isConfirmed ? transfer.hash : undefined,
            })}
            emptyMessage="The transaction hash appears here after you send."
            pendingMessage={
              transfer.isSending
                ? "Approve the request in your wallet."
                : `Waiting for ${SEPOLIA.name} to confirm the transaction.`
            }
            successLabel="Confirmed"
            fields={transfer.hash ? [{ label: "Transaction hash", value: transfer.hash, testId: "tx-hash-display" }] : []}
            onCopy={() => transfer.hash && hashCopy.copy(transfer.hash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={transfer.hash ? explorerTxUrl(transfer.hash) : undefined}
            explorerLabel={`View on ${SEPOLIA.explorerName}`}
            explorerTestId="tx-etherscan-link"
            errorTitle="Transaction failed"
            errorMessage={formatErrorMessage(transfer.errorMessage, { declinedMessage: "You declined the request in your wallet." })}
          />
        }>
        <form onSubmit={form.submit} noValidate data-testid="transfer-form">
          <ActionPanel
            title="Send ETH"
            api="useSendTransaction()"
            description="Send Sepolia ETH with wagmi, then wait for the receipt."
            actions={
              <Button type="submit" size="lg" isLoading={isTransferPending} data-testid="tx-submit-button">
                Send transaction
              </Button>
            }
            hint="Gas is paid from this account.">
            <TextField
              label="Recipient"
              value={form.to}
              onChange={(event) => form.setTo(event.target.value)}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
              error={form.errors.to}
              data-testid="tx-to-input"
            />
            <TextField
              label="Amount"
              value={form.amount}
              onChange={(event) => form.setAmount(event.target.value)}
              placeholder="0.001"
              inputMode="decimal"
              trailing={SEPOLIA.currencySymbol}
              error={form.errors.amount}
              data-testid="tx-amount-input"
            />
          </ActionPanel>
        </form>
      </Workbench>
    </AppShell>
  );
}
