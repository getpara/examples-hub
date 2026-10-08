"use client";

import { useCallback, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountMenu } from "@/components/ui/AccountMenu";
import { AccountStripWithNetworkTestId } from "@/components/ui/AccountStripWithNetworkTestId";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ChainMark } from "@/components/ui/ChainMark";
import { FundingPrompt } from "@/components/ui/FundingPrompt";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/LinkButton";
import { PickerIcon } from "@/components/ui/PickerIcon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { TextField } from "@/components/ui/TextField";
import { WalletPicker, type WalletPickerOption } from "@/components/ui/WalletPicker";
import { useGrazBalance } from "@/hooks/useGrazBalance";
import { useGrazTokenTransfer } from "@/hooks/useGrazTokenTransfer";
import { useGrazWalletConnection } from "@/hooks/useGrazWalletConnection";
import { explorerAddressUrl, explorerTxUrl, ICS_PROVIDER_TESTNET } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useAmountForm } from "@/lib/useAmountForm";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { compareWallets, walletDescription, walletName } from "@/lib/wallets";

const WALLET_DECLINED_MESSAGE = "You declined the request in your wallet.";

export function GrazExample() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);
  const wallet = useGrazWalletConnection({ onConnectSettled: closePicker });
  const balance = useGrazBalance(wallet.address);
  const transfer = useGrazTokenTransfer({ onSent: balance.refresh });
  const form = useAmountForm(transfer.send);
  const accountMenu = useAccountMenu(wallet.isConnected);
  const addressCopy = useCopyToClipboard();
  const hashCopy = useCopyToClipboard();

  const walletOptions: WalletPickerOption[] = [...wallet.wallets]
    .sort((first, second) => compareWallets(first.id, second.id))
    .map((option) =>
      option.isPara
        ? {
            id: option.id,
            name: walletName(option.id),
            description: "Email, phone, passkey, or social",
            connectingDescription: "Continue in the Para window",
            mark: <PickerIcon name="para-mark" className="size-6" />,
            testId: "auth-oauth-para",
          }
        : {
            id: option.id,
            name: walletName(option.id),
            description: walletDescription(option.id),
            mark: <ChainMark name="cosmos" className="size-6" />,
            testId: `wallet-option-${option.id}`,
          }
    );

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
      isConnecting={wallet.isConnecting}
      onConnect={() => setIsPickerOpen(true)}
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    const connectError = formatErrorMessage(wallet.connectErrorMessage, { declinedMessage: WALLET_DECLINED_MESSAGE });

    return (
      <AppShell header={header} footer={footer}>
        <WalletPicker
          isOpen={isPickerOpen}
          onClose={closePicker}
          options={walletOptions}
          onSelect={wallet.connectWallet}
          connectingId={wallet.connectingWalletType}
          testId="auth-modal"
          closeTestId="modal-close-button"
        />
        <SignInPanel
          title="Connect a Cosmos wallet"
          description="Use Para through Graz to connect to the Cosmos ICS Provider Testnet and send tokens."
          network={ICS_PROVIDER_TESTNET.networkLabel}>
          <Button size="lg" fullWidth onClick={() => setIsPickerOpen(true)} data-testid="auth-connect-button">
            Connect wallet
          </Button>
          {connectError && (
            <Alert variant="destructive" title="Connection failed">
              {connectError}
            </Alert>
          )}
        </SignInPanel>
      </AppShell>
    );
  }

  const { currencySymbol, explorerName } = ICS_PROVIDER_TESTNET;

  return (
    <AppShell header={header} footer={footer}>
      <AccountMenu
        isOpen={accountMenu.isOpen}
        onClose={accountMenu.close}
        address={wallet.address}
        connectionLabel={`Connected with ${walletName(wallet.activeWalletType)}`}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        explorerHref={explorerAddressUrl(wallet.address)}
        explorerLabel={`View on ${explorerName}`}
        onDisconnect={wallet.disconnectWallet}
        isDisconnecting={wallet.isDisconnecting}
        disconnectTestId="auth-logout-button"
      />
      <AccountStripWithNetworkTestId
        address={wallet.address}
        addressTestId="account-address-full"
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={ICS_PROVIDER_TESTNET.networkLabel}
        networkTestId="account-network-display"
        balance={formatBalance(balance.balance, currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      <Workbench
        aside={
          <ResultPanel
            status={getResultStatus({
              isPending: transfer.isSending,
              errorMessage: transfer.errorMessage,
              value: transfer.transactionHash,
            })}
            emptyMessage="The transaction hash appears here after you send."
            pendingMessage="Approve the request in your wallet."
            successLabel="Confirmed"
            fields={
              transfer.transactionHash
                ? [{ label: "Transaction hash", value: transfer.transactionHash, testId: "tx-hash-display" }]
                : []
            }
            onCopy={() => transfer.transactionHash && hashCopy.copy(transfer.transactionHash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={transfer.transactionHash ? explorerTxUrl(transfer.transactionHash) : undefined}
            explorerLabel={`View on ${explorerName}`}
            explorerTestId="tx-explorer-link"
            errorTitle="Transaction failed"
            errorMessage={formatErrorMessage(transfer.errorMessage, { declinedMessage: WALLET_DECLINED_MESSAGE })}
          />
        }>
        <form onSubmit={form.submit} noValidate data-testid="transfer-form">
          <ActionPanel
            title="Return tokens to the faucet"
            api="useSendTokens()"
            description={`Send ${currencySymbol} back to the testnet faucet with the Graz signing client.`}
            actions={
              <Button
                type="submit"
                size="lg"
                isLoading={transfer.isSending}
                disabled={!transfer.isReady || balance.isUnfunded}
                data-testid="tx-submit-button">
                Send transaction
              </Button>
            }
            hint={`Fees are paid in ${currencySymbol} from this account.`}>
            {balance.isUnfunded && (
              <FundingPrompt
                title="Need testnet tokens"
                message={`Get ${currencySymbol} from the faucet before sending a transfer.`}
                action={
                  <LinkButton
                    href={ICS_PROVIDER_TESTNET.faucetUrl}
                    target="_blank"
                    rel="noreferrer"
                    icon={<Icon name="arrow-up-right" className="size-icon-md" />}>
                    Open faucet
                  </LinkButton>
                }
              />
            )}
            <TextField
              label="Recipient"
              value={ICS_PROVIDER_TESTNET.faucetAddress}
              readOnly
              spellCheck={false}
              data-testid="tx-to-input"
            />
            <TextField
              label="Amount"
              value={form.amount}
              onChange={(event) => form.setAmount(event.target.value)}
              placeholder="0.001"
              inputMode="decimal"
              trailing={currencySymbol}
              error={form.error}
              data-testid="tx-amount-input"
            />
          </ActionPanel>
        </form>
      </Workbench>
    </AppShell>
  );
}
