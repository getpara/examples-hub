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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Staking & Delegation Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Delegate your ATOM to validators and participate in network security. Earn staking
          rewards while supporting the Cosmos ecosystem.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delegate to Validator</h2>

            {error && <StatusAlert type="error" message={error.message} />}
            {txHash && (
              <StatusAlert
                type="success"
                message={`Delegation successful! Gas used: ${gasUsed}`}
              />
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="validator" className="block text-sm font-medium text-gray-700">
                  Select Validator
                </label>
                <select
                  id="validator"
                  value={selectedValidator}
                  onChange={(e) => setSelectedValidator(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
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
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ({DEFAULT_CHAIN.coinDenom})
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Delegations</h2>
            <div className="rounded-none border border-gray-200">
              {!isReady ? (
                <div className="p-6 text-center text-gray-500">
                  Connect wallet to view delegations
                </div>
              ) : delegations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No delegations found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {delegations.map((delegation, index) => (
                    <div key={index} className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          Validator: {delegation.delegation.validatorAddress.slice(0, 20)}...
                        </p>
                        <p className="text-gray-600 mt-1">
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

            <div className="mt-6 rounded-none border border-gray-200 bg-gray-50">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Staking Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Unbonding Period:</span>{" "}
                    <span className="font-medium">21 days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated APR:</span>{" "}
                    <span className="font-medium">~15-20%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Minimum Stake:</span>{" "}
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
