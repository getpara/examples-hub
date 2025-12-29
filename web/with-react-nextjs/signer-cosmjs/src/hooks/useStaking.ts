"use client";

import { useState, useEffect, useCallback } from "react";
import { MsgDelegateEncodeObject, StargateClient, coins } from "@cosmjs/stargate";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { useParaSigner } from "./useParaSigner";
import { useCosmosQueryClient } from "./useCosmosQueryClient";
import { DEFAULT_CHAIN } from "@/config/chains";

export interface Validator {
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

export interface Delegation {
  delegation: {
    validatorAddress: string;
  };
  balance: {
    amount: string;
  };
}

export function useStaking() {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatorsLoading, setIsValidatorsLoading] = useState(false);
  const [isDelegationsLoading, setIsDelegationsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();

  const fetchValidators = useCallback(async () => {
    if (!queryClient) return;

    setIsValidatorsLoading(true);
    try {
      const extendedClient = queryClient as StargateClient & {
        staking: {
          validators: (status: string) => Promise<{ validators: Validator[] }>;
        };
      };
      const response = await extendedClient.staking.validators("BOND_STATUS_BONDED");
      setValidators(response.validators.slice(0, 10));
    } catch (err) {
      console.error("Error fetching validators:", err);
    } finally {
      setIsValidatorsLoading(false);
    }
  }, [queryClient]);

  const fetchDelegations = useCallback(async () => {
    if (!queryClient || !address) return;

    setIsDelegationsLoading(true);
    try {
      const extendedClient = queryClient as StargateClient & {
        staking: {
          delegatorDelegations: (address: string) => Promise<{ delegationResponses: Delegation[] }>;
        };
      };
      const response = await extendedClient.staking.delegatorDelegations(address);
      setDelegations(response.delegationResponses);
    } catch (err) {
      console.error("Error fetching delegations:", err);
    } finally {
      setIsDelegationsLoading(false);
    }
  }, [queryClient, address]);

  useEffect(() => {
    fetchValidators();
  }, [fetchValidators]);

  useEffect(() => {
    fetchDelegations();
  }, [fetchDelegations]);

  const delegate = useCallback(
    async (validatorAddress: string, amount: string) => {
      if (!address) {
        throw new Error("Please connect your wallet to delegate.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!validatorAddress) {
        throw new Error("Please select a validator.");
      }

      const amountInMinimalDenom = Math.floor(
        parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals)
      );
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setGasUsed(null);

      try {
        const delegateMsg: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: MsgDelegate.fromPartial({
            delegatorAddress: address,
            validatorAddress,
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
        setGasUsed(result.gasUsed);

        // Refresh delegations after successful delegation
        await fetchDelegations();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delegate");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address, fetchDelegations]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setGasUsed(null);
    setError(null);
  }, []);

  return {
    // Actions
    delegate,
    fetchValidators,
    fetchDelegations,

    // Query data
    validators,
    delegations,

    // Transaction result
    txHash,
    gasUsed,

    // Loading states
    isLoading: isLoading || isSignerLoading,
    isValidatorsLoading,
    isDelegationsLoading,
    isReady: !!signingClient && !!address,

    // Error and reset
    error,
    reset,
  };
}
