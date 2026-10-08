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
import { useFriendbot } from "@/hooks/useFriendbot";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useXlmTransfer } from "@/hooks/useXlmTransfer";
import { STELLAR_TESTNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function XlmTransferContainer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const signer = useParaSigner();
  const balance = useAccountBalance(signer.address ?? "");
  const friendbot = useFriendbot();
  const transfer = useXlmTransfer();
  const hashCopy = useCopyToClipboard();

  const fund = async () => {
    await friendbot.fund();
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
            value: transfer.txHash,
          })}
          emptyMessage="The transaction hash appears here after you send."
          pendingMessage={
            transfer.isSubmitting
              ? "Transaction submitted. Waiting for confirmation."
              : "Signing the transaction with Para."
          }
          successLabel="Confirmed"
          fields={transfer.txHash ? [{ label: "Transaction hash", value: transfer.txHash }] : []}
          onCopy={() => transfer.txHash && hashCopy.copy(transfer.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={transfer.txHash ? explorerTxUrl(transfer.txHash) : undefined}
          explorerLabel={`View on ${STELLAR_TESTNET.explorerName}`}
          errorTitle="Transaction failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="XLM transfer"
          api="signer.signTransaction(xdr)"
          description="Build a payment, sign it with Para, then submit it to Horizon on testnet."
          hint="Fees are paid in XLM from this account."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={transfer.isLoading}
              disabled={!to || !amount || !transfer.isReady || balance.balance === null || balance.isUnfunded}>
              Send transaction
            </Button>
          }>
          {balance.isUnfunded && !friendbot.success && (
            <FundingPrompt
              title="Fund this account"
              message="Stellar accounts need XLM before they exist on the network. Friendbot sends 10,000 test XLM."
              action={
                <Button
                  variant="outline"
                  isLoading={friendbot.isLoading}
                  disabled={!friendbot.isReady}
                  onClick={fund}
                  data-testid="stellar-fund-button">
                  Fund with Friendbot
                </Button>
              }
            />
          )}
          {friendbot.success && (
            <Alert variant="success" title="Account funded with 10,000 test XLM!" testId="stellar-fund-success">
              You can send XLM now.
            </Alert>
          )}
          {friendbot.error && (
            <Alert variant="destructive" title="Funding failed">
              {formatErrorMessage(friendbot.error.message)}
            </Alert>
          )}
          <TextField
            label="Recipient"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="G…"
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
            placeholder="10"
            trailing={STELLAR_TESTNET.currencySymbol}
            required
            disabled={transfer.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
