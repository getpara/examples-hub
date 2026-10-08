"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Aside } from "@/components/ui/Aside";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { LoadingMark } from "@/components/ui/LoadingMark";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SelectField } from "@/components/ui/SelectField";
import { StatusHint } from "@/components/ui/StatusHint";
import { TextField } from "@/components/ui/TextField";
import { useStaking } from "@/hooks/useStaking";
import { ICS_PROVIDER_TESTNET, explorerTxUrl, fromMinimalDenom } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { BROADCAST_PENDING_MESSAGE, formatValidatorOption } from "@/lib/display";
import { formatBalance, formatErrorMessage, shortenAddress } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function StakingContainer() {
  const [validatorAddress, setValidatorAddress] = useState("");
  const [amount, setAmount] = useState("");
  const staking = useStaking();
  const hashCopy = useCopyToClipboard();

  const delegate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    staking.reset();
    await staking.delegate(validatorAddress, amount).catch(() => undefined);
  };

  const validatorOptions = [
    { value: "", label: staking.isValidatorsLoading ? "Loading validators" : "Choose a validator" },
    ...staking.validators.map((validator) => ({
      value: validator.operatorAddress,
      label: formatValidatorOption(validator.description.moniker, validator.commission.commissionRates.rate),
    })),
  ];

  const delegationRows = staking.delegations.map(({ delegation, balance }) => ({
    label:
      staking.validators.find((validator) => validator.operatorAddress === delegation.validatorAddress)?.description
        .moniker ?? shortenAddress(delegation.validatorAddress),
    title: delegation.validatorAddress,
    value: formatBalance(fromMinimalDenom(balance.amount), ICS_PROVIDER_TESTNET.currencySymbol),
    tone: "data" as const,
  }));

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/staking" />}
      aside={
        <>
          <ResultPanel
            status={getResultStatus({
              isPending: staking.isLoading,
              errorMessage: staking.error?.message,
              value: staking.txHash,
            })}
            emptyMessage="The transaction hash appears here after you delegate."
            pendingMessage={BROADCAST_PENDING_MESSAGE}
            successLabel="Confirmed"
            fields={staking.txHash ? [{ label: "Transaction hash", value: staking.txHash }] : []}
            onCopy={() => staking.txHash && hashCopy.copy(staking.txHash)}
            copiedMessage="Transaction hash copied"
            copyStatus={hashCopy.status}
            explorerHref={staking.txHash ? explorerTxUrl(staking.txHash) : undefined}
            errorTitle="Delegation failed"
            errorMessage={formatErrorMessage(staking.error?.message ?? null)}
          />
          <Aside title="Your delegations" status={staking.isDelegationsLoading ? <LoadingMark /> : undefined}>
            {delegationRows.length > 0 ? (
              <Facts rows={delegationRows} />
            ) : (
              <StatusHint>{staking.isDelegationsLoading ? "Loading delegations." : "No delegations yet."}</StatusHint>
            )}
          </Aside>
        </>
      }>
      <form onSubmit={delegate}>
        <ActionPanel
          title="Staking"
          api="signAndBroadcast([MsgDelegate])"
          description={`Delegate ${ICS_PROVIDER_TESTNET.currencySymbol} to a bonded validator on the provider testnet.`}
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={staking.isLoading}
              disabled={!validatorAddress || !amount || !staking.isReady}>
              Delegate {ICS_PROVIDER_TESTNET.currencySymbol}
            </Button>
          }>
          <SelectField
            label="Validator"
            options={validatorOptions}
            value={validatorAddress}
            onChange={(event) => setValidatorAddress(event.target.value)}
            disabled={staking.isValidatorsLoading || staking.isLoading}
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
            trailing={ICS_PROVIDER_TESTNET.currencySymbol}
            required
            disabled={staking.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
