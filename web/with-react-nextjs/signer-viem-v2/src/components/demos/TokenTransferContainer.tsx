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
import { useTokenTransfer } from "@/hooks/useTokenTransfer";
import { HOLESKY, explorerTxUrl } from "@/lib/chain";
import { DEFAULT_TRANSFER_TOKEN_ADDRESS } from "@/lib/contracts";
import { DEMOS } from "@/lib/demos";
import { formatReading, transactionPendingMessage } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function TokenTransferContainer() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [contractAddress, setContractAddress] = useState<string>(DEFAULT_TRANSFER_TOKEN_ADDRESS);
  const token = useTokenTransfer(contractAddress);
  const hashCopy = useCopyToClipboard();

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    token.reset();

    const hash = await token.transfer(to, amount);

    if (!hash) {
      return;
    }

    setTo("");
    setAmount("");
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/token-transfer" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: token.isLoading,
            errorMessage: token.error?.message,
            value: token.txHash,
          })}
          emptyMessage="The transaction hash appears here after you send."
          pendingMessage={transactionPendingMessage(token.txHash)}
          successLabel="Confirmed"
          fields={token.txHash ? [{ label: "Transaction hash", value: token.txHash }] : []}
          onCopy={() => token.txHash && hashCopy.copy(token.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={token.txHash ? explorerTxUrl(token.txHash) : undefined}
          explorerLabel={`View on ${HOLESKY.explorerName}`}
          errorTitle="Transfer failed"
          errorMessage={formatErrorMessage(token.error?.message ?? null)}
        />
      }>
      <form onSubmit={send}>
        <ActionPanel
          title="Token transfer"
          api={`viemClient.writeContract({ functionName: "transfer" })`}
          description="Read ERC20 balances from the token contract, then transfer tokens with the viem wallet client."
          actions={
            <>
              <Button
                type="submit"
                size="lg"
                isLoading={token.isLoading}
                disabled={!to || !amount || !token.isReady}>
                Send tokens
              </Button>
              <Button
                variant="outline"
                size="lg"
                isLoading={token.isBalanceLoading}
                onClick={() => void token.fetchBalances()}
                icon={<Icon name="refresh" className="size-icon-md" />}>
                Refresh balances
              </Button>
            </>
          }>
          <Facts
            rows={[
              {
                label: "ETH for gas",
                value: formatReading(token.ethBalance, HOLESKY.currencySymbol, token.isBalanceLoading),
                tone: "data",
              },
              {
                label: `${token.tokenSymbol} balance`,
                value: formatReading(token.tokenBalance, token.tokenSymbol, token.isBalanceLoading),
                tone: "data",
              },
            ]}
          />
          <TextField
            label="Token contract"
            value={contractAddress}
            onChange={(event) => setContractAddress(event.target.value)}
            placeholder="0x…"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={token.isLoading}
          />
          <TextField
            label="Recipient"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            placeholder="0x…"
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
            placeholder="1"
            trailing={token.tokenSymbol}
            required
            disabled={token.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
