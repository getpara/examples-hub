"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useEthTransfer } from "@/hooks/useEthTransfer";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { HOLESKY, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { transactionPendingMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function EthTransferContainer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const wallet = useEvmWalletConnection();
  const balance = useAccountBalance(wallet.address);
  const transfer = useEthTransfer();
  const hashCopy = useCopyToClipboard();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    transfer.reset();

    try {
      await transfer.sendTransaction(to, amount);
    } catch {
      return;
    }

    await balance.refresh();
    setTo("");
    setAmount("");
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/eth-transfer" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: transfer.isLoading,
            errorMessage: transfer.error?.message,
            value: transfer.txHash,
          })}
          emptyMessage="The transaction hash appears here after you send."
          pendingMessage={transactionPendingMessage(transfer.txHash)}
          successLabel="Confirmed"
          fields={transfer.txHash ? [{ label: "Transaction hash", value: transfer.txHash }] : []}
          onCopy={() => transfer.txHash && hashCopy.copy(transfer.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={transfer.txHash ? explorerTxUrl(transfer.txHash) : undefined}
          explorerLabel={`View on ${HOLESKY.explorerName}`}
          errorTitle="Transaction failed"
          errorMessage={formatErrorMessage(transfer.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="ETH transfer"
          api="signer.sendTransaction(tx)"
          description={`Send ${HOLESKY.name} ETH with the ethers signer, then wait for one confirmation.`}
          hint="Gas is paid from this account."
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
            placeholder="0.001"
            trailing={HOLESKY.currencySymbol}
            required
            disabled={transfer.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
