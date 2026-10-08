"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { FundingPrompt } from "@/components/ui/FundingPrompt";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useSuiFaucet } from "@/hooks/useSuiFaucet";
import { useSuiTransfer } from "@/hooks/useSuiTransfer";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";
import { SUI_TESTNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function SuiTransferContainer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const wallet = useSuiWalletConnection();
  const balance = useAccountBalance(wallet.address);
  const faucet = useSuiFaucet();
  const transfer = useSuiTransfer();
  const digestCopy = useCopyToClipboard();

  const isUnfunded = balance.balance !== null && Number(balance.balance) === 0;

  const fund = async () => {
    await faucet.fund();
    await balance.refresh();
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    transfer.reset();
    await transfer.transfer(to, amount);
    await balance.refresh();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/sign-transaction" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: transfer.isLoading,
            errorMessage: transfer.error?.message,
            value: transfer.txDigest,
          })}
          emptyMessage="The transaction digest appears here after you send."
          pendingMessage="Approve the request in the Para window."
          successLabel="Confirmed"
          fields={transfer.txDigest ? [{ label: "Transaction digest", value: transfer.txDigest }] : []}
          onCopy={() => transfer.txDigest && digestCopy.copy(transfer.txDigest)}
          copiedMessage="Transaction digest copied"
          copyStatus={digestCopy.status}
          explorerHref={transfer.txDigest ? explorerTxUrl(transfer.txDigest) : undefined}
          explorerLabel={`View on ${SUI_TESTNET.explorerName}`}
          errorTitle="Transaction failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="SUI transfer"
          api="useParaSuiSignTransaction()"
          description={`Build a transfer, sign it with Para, then execute it on ${SUI_TESTNET.name} over gRPC.`}
          hint="Gas is paid in SUI from this account."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={transfer.isLoading}
              disabled={!to || !amount || !transfer.isReady || balance.balance === null || isUnfunded}>
              Send transaction
            </Button>
          }>
          {isUnfunded && !faucet.success && (
            <FundingPrompt
              title="Fund this account"
              message="Sui transactions pay gas in SUI. The testnet faucet sends test SUI to this account."
              action={
                <Button
                  variant="outline"
                  isLoading={faucet.isLoading}
                  disabled={!wallet.address}
                  onClick={fund}
                  data-testid="sui-fund-button">
                  Fund with faucet
                </Button>
              }
            />
          )}
          {faucet.success && (
            <Alert variant="success" title="Faucet request submitted!" testId="sui-fund-success">
              Refresh the balance in a moment.
            </Alert>
          )}
          {faucet.error && (
            <Alert variant="destructive" title="Funding failed">
              {formatErrorMessage(faucet.error.message)}
            </Alert>
          )}
          <TextField
            label="Recipient"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="0x…"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={transfer.isLoading}
          />
          <TextField
            label="Amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.01"
            trailing={SUI_TESTNET.currencySymbol}
            required
            disabled={transfer.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
