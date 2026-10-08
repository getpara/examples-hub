"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useCreateToken } from "@/hooks/useCreateToken";
import { useParaSigner } from "@/hooks/useParaSigner";
import { SOLANA_DEVNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { TRANSACTION_PENDING_MESSAGE, mintCreatedMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function CreateTokenContainer() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const signer = useParaSigner();
  const balance = useAccountBalance(signer.address ?? "");
  const token = useCreateToken();
  const signatureCopy = useCopyToClipboard();

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    token.reset();
    await token.createToken(tokenName, tokenSymbol);
    await balance.refresh();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/program-create-token" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: token.isLoading,
            errorMessage: token.error?.message,
            value: token.txSignature,
          })}
          emptyMessage="The transaction signature appears here after the program runs."
          pendingMessage={TRANSACTION_PENDING_MESSAGE}
          successLabel="Confirmed"
          fields={token.txSignature ? [{ label: "Transaction signature", value: token.txSignature }] : []}
          onCopy={() => token.txSignature && signatureCopy.copy(token.txSignature)}
          copiedMessage="Transaction signature copied"
          copyStatus={signatureCopy.status}
          explorerHref={token.txSignature ? explorerTxUrl(token.txSignature) : undefined}
          explorerLabel={`View on ${SOLANA_DEVNET.explorerName}`}
          errorTitle="Token creation failed"
          errorMessage={formatErrorMessage(token.error?.message ?? null)}
        />
      }>
      <form onSubmit={create}>
        <ActionPanel
          title="Create token"
          api="program.methods.createToken(name, symbol).rpc()"
          description="Calls the demo Anchor program on Devnet with the Para signer as the payer and mint authority."
          hint="Creates a Token-2022 mint owned by this wallet."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={token.isLoading}
              disabled={!tokenName || !tokenSymbol || !token.isReady}>
              Create token
            </Button>
          }>
          <TextField
            label="Token name"
            value={tokenName}
            onChange={(event) => setTokenName(event.target.value)}
            placeholder="My Token"
            autoComplete="off"
            required
            disabled={token.isLoading}
          />
          <TextField
            label="Token symbol"
            value={tokenSymbol}
            onChange={(event) => setTokenSymbol(event.target.value)}
            placeholder="MTK"
            autoComplete="off"
            required
            disabled={token.isLoading}
          />
          {token.txSignature && token.mintAddress && (
            <Alert variant="success" title="Token created successfully!">
              {mintCreatedMessage(token.mintAddress)}
            </Alert>
          )}
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
