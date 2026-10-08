"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStripWithTestIds } from "@/components/ui/AccountStripWithTestIds";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useSponsoredTransaction } from "@/hooks/useSponsoredTransaction";
import { explorerTxUrl, SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function Gelato7702Example() {
  const wallet = useParaModalWallet();
  const balance = useAccountBalance();
  const smartAccount = useSmartAccount({ enabled: wallet.isConnected });
  const transaction = useSponsoredTransaction(smartAccount.smartAccount);
  const addressCopy = useCopyToClipboard();
  const hashCopy = useCopyToClipboard();

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
          description="Connect with Para to send an EIP-7702 transaction through Gelato."
          network={SEPOLIA.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const accountAddress = smartAccount.address ?? wallet.address;

  return (
    <AppShell header={header} footer={footer}>
      <AccountStripWithTestIds
        address={accountAddress}
        addressTestId={smartAccount.address ? "delegated-account-address" : undefined}
        addressBadge={smartAccount.address ? "EIP-7702" : undefined}
        onCopyAddress={() => addressCopy.copy(accountAddress)}
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
              isPending: transaction.isPending,
              errorMessage: transaction.errorMessage,
              value: transaction.transactionHash,
            })}
            emptyMessage="The transaction hash appears here after you send."
            pendingMessage="Sending gas-sponsored EIP-7702 transaction."
            successLabel="Confirmed"
            fields={
              transaction.transactionHash
                ? [{ label: "Transaction hash", value: transaction.transactionHash, testId: "transaction-hash-display" }]
                : []
            }
            onCopy={() => transaction.transactionHash && hashCopy.copy(transaction.transactionHash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={transaction.transactionHash ? explorerTxUrl(transaction.transactionHash) : undefined}
            explorerLabel={`View on ${SEPOLIA.explorerName}`}
            errorTitle="Transaction failed"
            errorMessage={formatErrorMessage(transaction.errorMessage)}
          />
        }>
        <ActionPanel
          title="Send an EIP-7702 transaction"
          api="smartAccount.sendTransaction({ to })"
          description="Sends a zero-value transaction using Gelato EIP-7702 gas sponsorship. Your address keeps working as the account."
          hint={smartAccount.isLoading ? "Preparing the EIP-7702 account." : "Gas is sponsored. Your address pays nothing."}
          actions={
            <Button
              size="lg"
              isLoading={transaction.isPending}
              disabled={!smartAccount.smartAccount}
              onClick={() => void transaction.send()}
              data-testid="send-sponsored-transaction-button">
              Send Sponsored Transaction
            </Button>
          }>
          {smartAccount.errorMessage && (
            <Alert variant="destructive" title="EIP-7702 account unavailable">
              {formatErrorMessage(smartAccount.errorMessage)}
            </Alert>
          )}
          <Facts
            rows={[
              { label: "Network", value: SEPOLIA.name },
              { label: "Target", value: transaction.targetAddress, tone: "mono" },
              { label: "Value", value: `0 ${SEPOLIA.currencySymbol}` },
              { label: "Gas", value: "Sponsored" },
            ]}
          />
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
