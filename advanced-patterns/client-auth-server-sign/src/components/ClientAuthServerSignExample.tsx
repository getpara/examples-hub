"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useServerSignedTransfer, type TransferPhase } from "@/hooks/useServerSignedTransfer";
import { SEPOLIA, explorerTxUrl } from "@/lib/chain";
import { PARA_API_KEY } from "@/lib/environment";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

const PENDING_MESSAGES: Record<TransferPhase, string> = {
  idle: "",
  signing: "Your server is signing and broadcasting the transaction.",
  confirming: `Waiting for ${SEPOLIA.name} to confirm the transaction.`,
};

export function ClientAuthServerSignExample() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const wallet = useParaModalWallet();
  const balance = useAccountBalance(wallet.address);
  const transfer = useServerSignedTransfer(wallet.address);
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
          description="Sign in on the client. Your server then signs transactions with the session you hand it."
          network={SEPOLIA.networkLabel}>
          {!PARA_API_KEY && (
            <Alert variant="warning" title="API key missing">
              Add NEXT_PUBLIC_PARA_API_KEY to your .env file, then rebuild the app.
            </Alert>
          )}
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await transfer.send(to, amount);
    } catch {
      return;
    }

    await balance.refresh();
    setTo("");
    setAmount("");
  };

  const transactionHash = transfer.result?.transactionHash;

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
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
              isPending: transfer.isPending,
              errorMessage: transfer.errorMessage,
              value: transactionHash,
            })}
            emptyMessage="The server-signed transaction appears here after you send."
            pendingMessage={PENDING_MESSAGES[transfer.phase]}
            successLabel="Confirmed"
            fields={
              transfer.result
                ? [
                    { label: "Transaction hash", value: transfer.result.transactionHash },
                    { label: "Signed transaction", value: transfer.result.signedTransaction },
                  ]
                : []
            }
            onCopy={() => transactionHash && hashCopy.copy(transactionHash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={transactionHash ? explorerTxUrl(transactionHash) : undefined}
            explorerLabel={`View on ${SEPOLIA.explorerName}`}
            errorTitle="Transaction failed"
            errorMessage={formatErrorMessage(transfer.errorMessage)}
          />
        }>
        <form onSubmit={send}>
          <ActionPanel
            title="Send ETH, signed on the server"
            api="POST /api/signing"
            description={`The browser builds the transfer and exports the session. Your server imports the session, signs with the Para ethers signer, and broadcasts to ${SEPOLIA.name}.`}
            hint="Gas is paid from this account."
            actions={
              <Button
                type="submit"
                size="lg"
                isLoading={transfer.isPending}
                disabled={!to || !amount || !transfer.isReady}>
                Send transaction
              </Button>
            }>
            <TextField
              label="Recipient"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              required
              disabled={transfer.isPending}
            />
            <TextField
              label="Amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.001"
              trailing={SEPOLIA.currencySymbol}
              required
              disabled={transfer.isPending}
            />
          </ActionPanel>
        </form>
      </Workbench>
    </AppShell>
  );
}
