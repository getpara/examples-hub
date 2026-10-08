"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useAtomTransfer } from "@/hooks/useAtomTransfer";
import { useCosmosWalletConnection } from "@/hooks/useCosmosWalletConnection";
import { ICS_PROVIDER_TESTNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { BROADCAST_PENDING_MESSAGE } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function AtomTransferContainer() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const wallet = useCosmosWalletConnection();
  const balance = useAccountBalance(wallet.address);
  const transfer = useAtomTransfer();
  const hashCopy = useCopyToClipboard();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    transfer.reset();

    try {
      await transfer.sendTokens(recipient, amount);
    } catch {
      return;
    }

    await balance.refresh();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/atom-transfer" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: transfer.isLoading,
            errorMessage: transfer.error?.message,
            value: transfer.txHash,
          })}
          emptyMessage="The transaction hash appears here after you send."
          pendingMessage={BROADCAST_PENDING_MESSAGE}
          successLabel="Confirmed"
          fields={transfer.txHash ? [{ label: "Transaction hash", value: transfer.txHash }] : []}
          onCopy={() => transfer.txHash && hashCopy.copy(transfer.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={transfer.txHash ? explorerTxUrl(transfer.txHash) : undefined}
          errorTitle="Transaction failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="ATOM transfer"
          api="signingClient.sendTokens(from, to, amount, fee)"
          description={`Send ${ICS_PROVIDER_TESTNET.currencySymbol} to another Cosmos address on the ${ICS_PROVIDER_TESTNET.name}.`}
          hint={`Fees are paid in ${ICS_PROVIDER_TESTNET.currencySymbol} from this account.`}
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={transfer.isLoading}
              disabled={!recipient || !amount || !transfer.isReady}>
              Send {ICS_PROVIDER_TESTNET.currencySymbol}
            </Button>
          }>
          <TextField
            label="Recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="cosmos1…"
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
            placeholder="0.1"
            trailing={ICS_PROVIDER_TESTNET.currencySymbol}
            required
            disabled={transfer.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
