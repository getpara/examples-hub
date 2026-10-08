"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useIbcTransfer } from "@/hooks/useIbcTransfer";
import { IBC_TRANSFER, ICS_PROVIDER_TESTNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { BROADCAST_PENDING_MESSAGE } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function IbcTransferContainer() {
  const [channel, setChannel] = useState<string>(IBC_TRANSFER.defaultChannel);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const transfer = useIbcTransfer();
  const hashCopy = useCopyToClipboard();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    transfer.reset();
    await transfer.sendIbcTransfer(recipient, amount, channel).catch(() => undefined);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/ibc-transfer" />}
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
          errorTitle="IBC transfer failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="IBC transfer"
          api="signAndBroadcast([MsgTransfer])"
          description={`Send ${ICS_PROVIDER_TESTNET.currencySymbol} to another Cosmos chain over IBC. The transfer times out after one hour.`}
          hint="Relaying to the destination chain can take a few minutes."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={transfer.isLoading}
              disabled={!channel || !recipient || !amount || !transfer.isReady}>
              Send IBC transfer
            </Button>
          }>
          <TextField
            label="IBC channel"
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            placeholder={IBC_TRANSFER.defaultChannel}
            autoComplete="off"
            spellCheck={false}
            required
            disabled={transfer.isLoading}
          />
          <TextField
            label="Recipient on the destination chain"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="osmo1… or juno1…"
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
