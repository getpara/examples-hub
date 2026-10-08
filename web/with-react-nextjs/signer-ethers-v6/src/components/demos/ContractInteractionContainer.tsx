"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextField } from "@/components/ui/TextField";
import { useContractInteraction } from "@/hooks/useContractInteraction";
import { HOLESKY, explorerTxUrl } from "@/lib/chain";
import { PARA_TEST_TOKEN } from "@/lib/contracts";
import { DEMOS } from "@/lib/demos";
import { formatMintProgress, formatReading, transactionPendingMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function ContractInteractionContainer() {
  const [amount, setAmount] = useState("");
  const contract = useContractInteraction();
  const hashCopy = useCopyToClipboard();

  const mint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    contract.reset();

    try {
      await contract.mint(amount);
    } catch {
      return;
    }

    setAmount("");
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/contract-interaction" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: contract.isLoading,
            errorMessage: contract.error?.message,
            value: contract.txHash,
          })}
          emptyMessage="The transaction hash appears here after you mint."
          pendingMessage={transactionPendingMessage(contract.txHash)}
          successLabel="Confirmed"
          fields={contract.txHash ? [{ label: "Transaction hash", value: contract.txHash }] : []}
          onCopy={() => contract.txHash && hashCopy.copy(contract.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={contract.txHash ? explorerTxUrl(contract.txHash) : undefined}
          explorerLabel={`View on ${HOLESKY.explorerName}`}
          errorTitle="Mint failed"
          errorMessage={formatErrorMessage(contract.error?.message ?? null)}
        />
      }>
      <form onSubmit={mint}>
        <ActionPanel
          title="Contract interaction"
          api="token.mint(amount)"
          description={`Call the token contract with the ethers signer to mint ${PARA_TEST_TOKEN.symbol}. Each address can mint up to 10 ${PARA_TEST_TOKEN.symbol}.`}
          actions={
            <>
              <Button
                type="submit"
                size="lg"
                isLoading={contract.isLoading}
                disabled={!amount || !contract.isReady}>
                Mint tokens
              </Button>
              <Button
                variant="outline"
                size="lg"
                isLoading={contract.isDataLoading}
                onClick={() => void contract.fetchContractData()}
                icon={<Icon name="refresh" className="size-icon-md" />}>
                Refresh
              </Button>
            </>
          }>
          <Facts
            rows={[
              {
                label: `${PARA_TEST_TOKEN.symbol} balance`,
                value: formatReading(contract.tokenBalance, PARA_TEST_TOKEN.symbol, contract.isDataLoading),
                tone: "data",
              },
              {
                label: "Minted",
                value: formatMintProgress(
                  contract.mintedAmount,
                  contract.mintLimit,
                  PARA_TEST_TOKEN.symbol,
                  contract.isDataLoading
                ),
                tone: "data",
              },
            ]}
          />
          {contract.hasReachedLimit && (
            <Alert title="Mint limit reached">This address cannot mint more {PARA_TEST_TOKEN.symbol}.</Alert>
          )}
          <TextField
            label="Amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1"
            trailing={PARA_TEST_TOKEN.symbol}
            required
            disabled={contract.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
