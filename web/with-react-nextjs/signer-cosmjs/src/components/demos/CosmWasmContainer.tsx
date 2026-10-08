"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { useCosmWasmExecute } from "@/hooks/useCosmWasmExecute";
import { useCosmWasmQuery } from "@/hooks/useCosmWasmQuery";
import { explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { BROADCAST_PENDING_MESSAGE } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function CosmWasmContainer() {
  const [contractAddress, setContractAddress] = useState("");
  const [queryMessage, setQueryMessage] = useState('{"balance": {"address": "YOUR_ADDRESS_HERE"}}');
  const [executeMessage, setExecuteMessage] = useState('{"transfer": {"recipient": "cosmos1...", "amount": "1000000"}}');
  const query = useCosmWasmQuery();
  const execution = useCosmWasmExecute();
  const responseCopy = useCopyToClipboard();
  const hashCopy = useCopyToClipboard();

  const runQuery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    query.reset();
    await query.queryContract(contractAddress, queryMessage).catch(() => undefined);
  };

  const runExecute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    execution.reset();
    await execution.executeContract(contractAddress, executeMessage).catch(() => undefined);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/cosmwasm-interaction" />}
      aside={
        <>
          <ResultPanel
            title="Query result"
            status={getResultStatus({
              isPending: query.isLoading,
              errorMessage: query.error?.message,
              value: query.queryResult,
            })}
            emptyMessage="The contract response appears here after you query."
            fields={query.queryResult ? [{ label: "Response", value: query.queryResult }] : []}
            onCopy={() => query.queryResult && responseCopy.copy(query.queryResult)}
            copiedMessage="Response copied"
            copyStatus={responseCopy.status}
            errorTitle="Query failed"
            errorMessage={formatErrorMessage(query.error?.message ?? null)}
          />
          <ResultPanel
            title="Execute result"
            status={getResultStatus({
              isPending: execution.isLoading,
              errorMessage: execution.error?.message,
              value: execution.txHash,
            })}
            emptyMessage="The transaction hash appears here after you execute."
            pendingMessage={BROADCAST_PENDING_MESSAGE}
            successLabel="Confirmed"
            fields={execution.txHash ? [{ label: "Transaction hash", value: execution.txHash }] : []}
            onCopy={() => execution.txHash && hashCopy.copy(execution.txHash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={execution.txHash ? explorerTxUrl(execution.txHash) : undefined}
            errorTitle="Execution failed"
            errorMessage={formatErrorMessage(execution.error?.message ?? null)}
          />
        </>
      }>
      <form onSubmit={runQuery}>
        <ActionPanel
          title="Query contract"
          api="client.queryContractSmart(contract, query)"
          description="Read contract state. Queries are free and need no signature."
          actions={
            <Button type="submit" size="lg" isLoading={query.isLoading} disabled={!contractAddress}>
              Query contract
            </Button>
          }>
          <TextField
            label="Contract address"
            value={contractAddress}
            onChange={(event) => setContractAddress(event.target.value)}
            placeholder="cosmos1…"
            autoComplete="off"
            spellCheck={false}
            required
          />
          <TextAreaField
            label="Query message"
            rows={4}
            value={queryMessage}
            onChange={(event) => setQueryMessage(event.target.value)}
            spellCheck={false}
            disabled={query.isLoading}
          />
        </ActionPanel>
      </form>
      <form onSubmit={runExecute}>
        <ActionPanel
          title="Execute contract"
          api="signingClient.execute(sender, contract, msg, fee)"
          description="Sign and broadcast a contract call to the contract address above."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={execution.isLoading}
              disabled={!contractAddress || !execution.isReady}>
              Execute contract
            </Button>
          }>
          <TextAreaField
            label="Execute message"
            rows={4}
            value={executeMessage}
            onChange={(event) => setExecuteMessage(event.target.value)}
            spellCheck={false}
            disabled={execution.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
