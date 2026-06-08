"use client";

import { useState } from "react";
import { useStaking } from "@/hooks/useStaking";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TxResult } from "@/components/ui/TxResult";
import { ActionButton } from "@/components/ui/ActionButton";
import { DEFAULT_CHAIN } from "@/config/chains";

export default function StakingPage() {
  const [selectedValidator, setSelectedValidator] = useState("");
  const [amount, setAmount] = useState("");

  const {
    delegate,
    validators,
    delegations,
    txHash,
    gasUsed,
    isLoading,
    isValidatorsLoading,
    isReady,
    error,
    reset,
  } = useStaking();

  const handleDelegate = async () => {
    reset();
    await delegate(selectedValidator, amount);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Staking & Delegation Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Delegate your ATOM to validators and participate in network security. Earn staking
          rewards while supporting the Cosmos ecosystem.
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Delegate to Validator</h2>

            {error && <StatusAlert type="error" message={error.message} />}
            {txHash && (
              <StatusAlert
                type="success"
                message={`Delegation successful! Gas used: ${gasUsed}`}
              />
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="validator" className="block text-sm font-medium text-foreground">
                  Select Validator
                </label>
                <select
                  id="validator"
                  value={selectedValidator}
                  onChange={(e) => setSelectedValidator(e.target.value)}
                  className="field-control"
                  disabled={isValidatorsLoading}>
                  <option value="">
                    {isValidatorsLoading ? "Loading validators..." : "Choose a validator"}
                  </option>
                  {validators.map((validator) => (
                    <option key={validator.operatorAddress} value={validator.operatorAddress}>
                      {validator.description.moniker} (
                      {(parseFloat(validator.commission.commissionRates.rate) * 100).toFixed(2)}%
                      commission)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label htmlFor="amount" className="block text-sm font-medium text-foreground">
                  Amount ({DEFAULT_CHAIN.coinDenom})
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="field-control"
                  placeholder="1.0"
                  step="0.000001"
                  min="0"
                />
              </div>

              <ActionButton
                onClick={handleDelegate}
                isLoading={isLoading}
                disabled={!isReady || !selectedValidator || !amount}
                loadingText="Delegating...">
                Delegate ATOM
              </ActionButton>

              {txHash && <TxResult hash={txHash} />}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Your Delegations</h2>
            <div className="rounded-2xl border border-border bg-card">
              {!isReady ? (
                <div className="p-6 text-center text-muted-foreground">
                  Connect wallet to view delegations
                </div>
              ) : delegations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No delegations found</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {delegations.map((delegation) => (
                    <div
                      key={`${delegation.delegation.validatorAddress}-${delegation.balance.amount}`}
                      className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-card-foreground">
                          Validator: {delegation.delegation.validatorAddress.slice(0, 20)}...
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Amount:{" "}
                          {(
                            Number(delegation.balance.amount) /
                            Math.pow(10, DEFAULT_CHAIN.coinDecimals)
                          ).toFixed(6)}{" "}
                          {DEFAULT_CHAIN.coinDenom}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/60">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Staking Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Unbonding Period:</span>{" "}
                    <span className="font-medium">21 days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated APR:</span>{" "}
                    <span className="font-medium">~15-20%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Minimum Stake:</span>{" "}
                    <span className="font-medium">0.000001 {DEFAULT_CHAIN.coinDenom}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
