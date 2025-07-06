"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { DEFAULT_CHAIN, COSMOS_TESTNET } from "@/config/chains";
import { MsgDelegateEncodeObject } from "@cosmjs/stargate";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { coins } from "@cosmjs/stargate";

interface Validator {
  operatorAddress: string;
  description: {
    moniker: string;
  };
  commission: {
    commissionRates: {
      rate: string;
    };
  };
  status: string;
}

export default function StakingPage() {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [selectedValidator, setSelectedValidator] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatorsLoading, setIsValidatorsLoading] = useState(false);
  const [delegations, setDelegations] = useState<any[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();
  const address = useAccountAddress();

  const fetchValidators = async () => {
    if (!queryClient) return;

    setIsValidatorsLoading(true);
    try {
      const response = await (queryClient as any).staking.validators("BOND_STATUS_BONDED");
      setValidators(response.validators.slice(0, 10)); // Show top 10 validators
    } catch (error) {
      console.error("Error fetching validators:", error);
    } finally {
      setIsValidatorsLoading(false);
    }
  };

  const fetchDelegations = async () => {
    if (!queryClient || !address) return;

    try {
      const response = await (queryClient as any).staking.delegatorDelegations(address);
      setDelegations(response.delegationResponses);
    } catch (error) {
      console.error("Error fetching delegations:", error);
    }
  };

  useEffect(() => {
    fetchValidators();
  }, [queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDelegations();
  }, [queryClient, address]); // eslint-disable-line react-hooks/exhaustive-deps

  const delegate = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to delegate.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!selectedValidator) {
        throw new Error("Please select a validator.");
      }

      const amountInMinimalDenom = Math.floor(parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals));
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm the delegation in your wallet...",
      });

      const delegateMsg: MsgDelegateEncodeObject = {
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: MsgDelegate.fromPartial({
          delegatorAddress: address,
          validatorAddress: selectedValidator,
          amount: coins(amountInMinimalDenom, DEFAULT_CHAIN.coinMinimalDenom)[0],
        }),
      };

      const result = await signingClient.signAndBroadcast(
        address,
        [delegateMsg],
        "auto",
        "Delegation via Para + CosmJS"
      );

      setTxHash(result.transactionHash);
      setStatus({
        show: true,
        type: "success",
        message: `Delegation successful! Gas used: ${result.gasUsed}`,
      });

      // Refresh delegations
      await fetchDelegations();
    } catch (error) {
      console.error("Error delegating:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delegate. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Staking & Delegation Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Delegate your ATOM to validators and participate in network security. Earn staking rewards while supporting the Cosmos ecosystem.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delegate to Validator</h2>
            
            {status.show && (
              <div
                className={`mb-4 rounded-none border ${
                  status.type === "success"
                    ? "bg-green-50 border-green-500 text-green-700"
                    : status.type === "error"
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "bg-gray-50 border-gray-500 text-gray-700"
                }`}>
                <p className="px-6 py-4 break-words">{status.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <label
                  htmlFor="validator"
                  className="block text-sm font-medium text-gray-700">
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
                      {validator.description.moniker} ({(parseFloat(validator.commission.commissionRates.rate) * 100).toFixed(2)}% commission)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700">
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

              <button
                onClick={delegate}
                className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !account?.isConnected || !selectedValidator || !amount}>
                {isLoading ? "Delegating..." : "Delegate ATOM"}
              </button>

              {txHash && (
                <div className="mt-4 rounded-none border border-gray-200">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Transaction Hash:</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {txHash}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Delegations</h2>
            <div className="rounded-none border border-gray-200">
              {!address ? (
                <div className="p-6 text-center text-gray-500">
                  Connect wallet to view delegations
                </div>
              ) : delegations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No delegations found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {delegations.map((delegation, index) => (
                    <div key={index} className="p-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          Validator: {delegation.delegation.validatorAddress.slice(0, 20)}...
                        </p>
                        <p className="text-gray-600 mt-1">
                          Amount: {(Number(delegation.balance.amount) / Math.pow(10, DEFAULT_CHAIN.coinDecimals)).toFixed(6)} {DEFAULT_CHAIN.coinDenom}
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