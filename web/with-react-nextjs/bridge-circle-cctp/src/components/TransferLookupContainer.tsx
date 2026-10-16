"use client";

import { useState, type FormEvent } from "react";
import type { Hash } from "viem";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Facts } from "@/components/ui/Facts";
import { TextField } from "@/components/ui/TextField";
import { useTransferStatus } from "@/hooks/useTransferStatus";
import { ARC, BASE, explorerTxUrl } from "@/lib/chain";
import { formatErrorMessage } from "@/lib/format";
import { getLookupRows } from "@/lib/transferDisplay";
import { parseBurnTxHash } from "@/lib/transferStatus";

const INVALID_HASH_MESSAGE = "Enter a transaction hash: 0x followed by 64 hex characters.";

export function TransferLookupContainer() {
  const [hashInput, setHashInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [submittedHash, setSubmittedHash] = useState<Hash | null>(null);
  const status = useTransferStatus(submittedHash);
  const lookup = status.lookup;
  const transfer = lookup?.isFound ? lookup.transfer : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const burnTxHash = parseBurnTxHash(hashInput);

    if (!burnTxHash) {
      setInputError(INVALID_HASH_MESSAGE);
      return;
    }

    setInputError(null);

    if (burnTxHash === submittedHash) {
      void status.refresh();
      return;
    }

    setSubmittedHash(burnTxHash);
  };

  return (
    <form onSubmit={submit}>
      <ActionPanel
        title="Look up a transfer"
        api="GET iris-api.circle.com/v2/messages/6?transactionHash="
        description={`Paste a ${BASE.name} burn transaction hash. The app asks Circle for the attestation and checks ${ARC.name} for the mint.`}
        actions={
          <Button
            type="submit"
            variant="outline"
            size="lg"
            isLoading={status.isLoading || status.isRefreshing}
            data-testid="transfer-lookup-button">
            Check status
          </Button>
        }>
        <TextField
          label="Burn transaction hash"
          value={hashInput}
          onChange={(event) => setHashInput(event.target.value)}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          error={inputError ?? undefined}
          data-testid="transfer-lookup-input"
        />
        {status.errorMessage && (
          <Alert variant="destructive" title="Status check failed" testId="transfer-lookup-error">
            {formatErrorMessage(status.errorMessage)}
          </Alert>
        )}
        {lookup && !lookup.isFound && (
          <Alert variant="warning" title="No transfer found" testId="transfer-lookup-not-found">
            Circle has no CCTP message for this {BASE.name} transaction. Check the hash, or wait a few seconds if the burn
            just confirmed.
          </Alert>
        )}
        {transfer && !transfer.isArcDestination && (
          <Alert variant="warning" title={`Not a transfer to ${ARC.name}`}>
            Circle found this burn, but it mints on another chain.
          </Alert>
        )}
        {transfer && (
          <div className="grid gap-3" data-testid="transfer-lookup-result">
            <Facts rows={getLookupRows(transfer)} />
            <ExternalLink href={explorerTxUrl(BASE, transfer.burnTxHash)}>View the burn on {BASE.explorerName}</ExternalLink>
            {transfer.forwardTxHash && (
              <ExternalLink href={explorerTxUrl(ARC, transfer.forwardTxHash)}>View the mint on {ARC.explorerName}</ExternalLink>
            )}
          </div>
        )}
      </ActionPanel>
    </form>
  );
}
