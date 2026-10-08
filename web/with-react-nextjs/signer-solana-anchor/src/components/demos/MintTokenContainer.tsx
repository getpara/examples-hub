"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useMintToken } from "@/hooks/useMintToken";
import { useParaSigner } from "@/hooks/useParaSigner";
import { SOLANA_DEVNET, explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { TRANSACTION_PENDING_MESSAGE, formatTokenReading } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MintTokenContainer() {
  const [mintAccount, setMintAccount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const signer = useParaSigner();
  const balance = useAccountBalance(signer.address ?? "");
  const token = useMintToken(mintAccount);
  const signatureCopy = useCopyToClipboard();

  const mint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    token.reset();
    await token.mintToken(recipient, amount);
    await balance.refresh();
  };

  const refreshBalances = () => {
    void balance.refresh();
    void token.fetchBalance();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/program-mint-token" />}
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
          errorTitle="Mint failed"
          errorMessage={formatErrorMessage(token.error?.message ?? null)}
        />
      }>
      <form onSubmit={mint}>
        <ActionPanel
          title="Mint token"
          api="program.methods.mintToken(amount).rpc()"
          description="Calls the demo Anchor program to mint tokens from a Token-2022 mint this wallet created."
          actions={
            <>
              <Button
                type="submit"
                size="lg"
                isLoading={token.isLoading}
                disabled={!mintAccount || !recipient || !amount || !token.isReady}>
                Mint tokens
              </Button>
              <Button
                variant="outline"
                size="lg"
                isLoading={balance.isRefreshing || token.isBalanceLoading}
                onClick={refreshBalances}
                icon={<Icon name="refresh" className="size-icon-md" />}>
                Refresh balances
              </Button>
            </>
          }>
          {mintAccount && (
            <Facts
              rows={[
                {
                  label: "Token balance",
                  value: formatTokenReading(token.tokenBalance, token.isBalanceLoading),
                  tone: "data",
                },
              ]}
            />
          )}
          <TextField
            label="Mint account"
            value={mintAccount}
            onChange={(event) => setMintAccount(event.target.value)}
            placeholder="Token mint address"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={token.isLoading}
          />
          <TextField
            label="Recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="Solana address"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={token.isLoading}
          />
          <TextField
            label="Amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            required
            disabled={token.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
