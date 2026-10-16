"use client";

import { useState, type FormEvent } from "react";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { useBridgeQuote } from "@/hooks/useBridgeQuote";
import type { WalletBalances } from "@/lib/balances";
import type { BridgeAdapter } from "@/lib/bridgeAdapter";
import { checkBridgeAmount } from "@/lib/bridgeAmount";
import { MINT_GAS_RESERVE, selectMintSigner, type MintSigner } from "@/lib/bridgeKit";
import { ARC, BASE } from "@/lib/chain";
import { formatErrorMessage } from "@/lib/format";
import { USDC, formatUsdc } from "@/lib/tokens";
import { getQuoteRows } from "@/lib/transferDisplay";

interface BridgeFormContainerProps {
  adapter: BridgeAdapter | null;
  isAdapterLoading: boolean;
  balances: WalletBalances | null;
  isBalanceLoading: boolean;
  isBalanceRefreshing: boolean;
  balanceErrorMessage: string | null;
  onRefreshBalances: () => void;
  isTransferRunning: boolean;
  onBridge: (amount: string, mintSigner: MintSigner) => Promise<boolean>;
}

const FORWARDER_NOTE = `Your wallet has less than ${formatUsdc(MINT_GAS_RESERVE)} ${USDC.symbol} on ${ARC.name} to pay gas, so Circle's forwarder mints this transfer for a fee. Once it lands, your Para wallet signs the mint on later transfers.`;

export function BridgeFormContainer({
  adapter,
  isAdapterLoading,
  balances,
  isBalanceLoading,
  isBalanceRefreshing,
  balanceErrorMessage,
  onRefreshBalances,
  isTransferRunning,
  onBridge,
}: BridgeFormContainerProps) {
  const [amountInput, setAmountInput] = useState("");
  const amountCheck = checkBridgeAmount(amountInput, balances);
  const mintSigner = balances ? selectMintSigner(balances.arcUsdc) : null;
  const quote = useBridgeQuote({ adapter, amount: amountCheck.amount, mintSigner });

  const quoteError = quote.quote && !quote.quote.isAmountCovered ? "This amount does not cover the fees." : null;
  const amountError = amountCheck.errorMessage ?? quoteError ?? undefined;
  const canBridge = Boolean(adapter && amountCheck.amount !== null && !amountError && mintSigner && quote.quote && !quote.isLoading);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canBridge || amountCheck.amount === null || !mintSigner) {
      return;
    }

    const isSuccess = await onBridge(formatUsdc(amountCheck.amount), mintSigner);

    if (isSuccess) {
      setAmountInput("");
    }
  };

  return (
    <form onSubmit={submit}>
      <ActionPanel
        title="Bridge USDC"
        api={`kit.bridge({ from: "${BASE.name}", to: "${ARC.name}" })`}
        description={`Circle CCTP burns USDC on ${BASE.name} and mints the same amount on ${ARC.name}. Your Para wallet signs the approval and burn, and signs the mint when it holds USDC on ${ARC.name} for gas.`}
        actions={
          <>
            <Button
              type="submit"
              size="lg"
              isLoading={isTransferRunning}
              disabled={!canBridge}
              data-testid="bridge-submit-button">
              Bridge USDC
            </Button>
            <Button
              variant="outline"
              size="lg"
              isLoading={isBalanceRefreshing}
              disabled={isBalanceLoading || isTransferRunning}
              onClick={onRefreshBalances}
              icon={<Icon name="refresh" className="size-icon-md" />}
              data-testid="refresh-balances-button">
              Refresh balances
            </Button>
          </>
        }
        hint={isAdapterLoading ? "Loading your wallet." : undefined}>
        <TextField
          label="Amount"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
          placeholder="1.00"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          trailing={USDC.symbol}
          error={amountError}
          hint={amountError ? undefined : `Sent from ${BASE.name}, received on ${ARC.name}.`}
          disabled={isTransferRunning}
          data-testid="bridge-amount-input"
        />
        {balanceErrorMessage && (
          <Alert variant="destructive" title="Balances not loaded">
            {formatErrorMessage(balanceErrorMessage)}
          </Alert>
        )}
        {mintSigner === "forwarder" && (
          <Alert variant="info" title="Circle delivers this mint" testId="bridge-forwarder-note">
            {FORWARDER_NOTE}
          </Alert>
        )}
        {quote.isLoading && (
          <p role="status" className="text-caption text-muted">
            Getting a quote from Circle.
          </p>
        )}
        {quote.quote && <Facts rows={getQuoteRows(quote.quote)} />}
        {quote.errorMessage && (
          <Alert variant="destructive" title="Quote unavailable">
            {formatErrorMessage(quote.errorMessage)}
          </Alert>
        )}
      </ActionPanel>
    </form>
  );
}
