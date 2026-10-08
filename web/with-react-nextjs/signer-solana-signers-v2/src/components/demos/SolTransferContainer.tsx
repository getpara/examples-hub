"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useSolTransfer } from "@/hooks/useSolTransfer";
import { SOLANA_DEVNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { transactionPendingMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function SolTransferContainer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const balance = useAccountBalance();
  const transfer = useSolTransfer();
  const signatureCopy = useCopyToClipboard();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    transfer.reset();
    await transfer.sendTransaction(to, amount);
    await balance.refresh();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/sol-transfer" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: transfer.isLoading,
            errorMessage: transfer.error?.message,
            value: transfer.txSignature,
          })}
          emptyMessage="The transaction signature appears here after you send."
          pendingMessage={transactionPendingMessage(transfer.txSignature)}
          successLabel="Confirmed"
          fields={transfer.txSignature ? [{ label: "Transaction signature", value: transfer.txSignature }] : []}
          onCopy={() => transfer.txSignature && signatureCopy.copy(transfer.txSignature)}
          copiedMessage="Transaction signature copied"
          copyStatus={signatureCopy.status}
          explorerHref={transfer.txSignature ? explorerTxUrl(transfer.txSignature) : undefined}
          explorerLabel={`View on ${SOLANA_DEVNET.explorerName}`}
          errorTitle="Transaction failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="SOL transfer"
          api="signTransactionMessageWithSigners(message)"
          description={`Build a transfer with @solana/kit, sign it with the Signers v2 signer, send it to ${SOLANA_DEVNET.name}, and wait for confirmation.`}
          hint="Fees are paid from this account."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={transfer.isLoading}
              disabled={!to || !amount || !transfer.isReady}>
              Send transaction
            </Button>
          }>
          <TextField
            label="Recipient"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="Solana address"
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
            placeholder="0.001"
            trailing={SOLANA_DEVNET.currencySymbol}
            required
            disabled={transfer.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
