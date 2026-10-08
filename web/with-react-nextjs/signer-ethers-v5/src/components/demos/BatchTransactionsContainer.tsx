"use client";

import type { FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useBatchTransactions } from "@/hooks/useBatchTransactions";
import { HOLESKY, explorerTxUrl } from "@/lib/chain";
import { PARA_TEST_TOKEN } from "@/lib/contracts";
import { DEMOS } from "@/lib/demos";
import { formatReading, transactionPendingMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { OPERATION_TYPES, useBatchOperations } from "@/lib/useBatchOperations";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function BatchTransactionsContainer() {
  const batch = useBatchTransactions();
  const form = useBatchOperations();
  const hashCopy = useCopyToClipboard();

  const execute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    batch.reset();

    try {
      await batch.executeMulticall(form.operations);
    } catch {
      return;
    }

    form.clear();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/batch-transactions" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: batch.isLoading,
            errorMessage: batch.error?.message,
            value: batch.txHash,
          })}
          emptyMessage="The transaction hash appears here after you send the batch."
          pendingMessage={transactionPendingMessage(batch.txHash)}
          successLabel="Confirmed"
          fields={batch.txHash ? [{ label: "Transaction hash", value: batch.txHash }] : []}
          onCopy={() => batch.txHash && hashCopy.copy(batch.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={batch.txHash ? explorerTxUrl(batch.txHash) : undefined}
          explorerLabel={`View on ${HOLESKY.explorerName}`}
          errorTitle="Batch failed"
          errorMessage={formatErrorMessage(batch.error?.message ?? null)}
        />
      }>
      <form onSubmit={execute}>
        <ActionPanel
          title="Batch transactions"
          api="token.multicall(calls)"
          description="Encode several mint and transfer calls, then send them as one transaction with the ethers signer."
          actions={
            <>
              <Button
                type="submit"
                size="lg"
                isLoading={batch.isLoading}
                disabled={!batch.isReady || !form.isComplete}>
                Execute batch
              </Button>
              <Button
                variant="outline"
                size="lg"
                isLoading={batch.isBalanceLoading}
                onClick={() => void batch.fetchTokenData()}
                icon={<Icon name="refresh" className="size-icon-md" />}>
                Refresh balance
              </Button>
            </>
          }>
          <Facts
            rows={[
              {
                label: `${PARA_TEST_TOKEN.symbol} balance`,
                value: formatReading(batch.tokenBalance, PARA_TEST_TOKEN.symbol, batch.isBalanceLoading),
                tone: "data",
              },
            ]}
          />
          {form.operations.map((operation, index) => (
            <FieldGroup
              key={index}
              title={`Operation ${index + 1}`}
              action={
                form.operations.length > 1 && (
                  <Button
                    variant="link"
                    size="sm"
                    aria-label={`Remove operation ${index + 1}`}
                    onClick={() => form.remove(index)}
                    disabled={batch.isLoading}>
                    Remove
                  </Button>
                )
              }>
              <SelectField
                label="Type"
                options={OPERATION_TYPES}
                value={operation.type}
                onChange={(event) => form.setType(index, event.target.value)}
                disabled={batch.isLoading}
              />
              {operation.type === "transfer" && (
                <TextField
                  label="Recipient"
                  value={operation.recipient}
                  onChange={(event) => form.setField(index, "recipient", event.target.value)}
                  placeholder="0x…"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={batch.isLoading}
                />
              )}
              <TextField
                label="Amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={operation.amount}
                onChange={(event) => form.setField(index, "amount", event.target.value)}
                placeholder="1"
                trailing={PARA_TEST_TOKEN.symbol}
                disabled={batch.isLoading}
              />
            </FieldGroup>
          ))}
          <Button variant="outline" className="justify-self-start" onClick={form.add} disabled={batch.isLoading}>
            Add operation
          </Button>
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
