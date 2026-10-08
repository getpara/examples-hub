import { useState, useEffect, useCallback } from "react";
import { coin, type MsgDelegateEncodeObject } from "@cosmjs/stargate";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import type { DelegationResponse, Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";
import { ICS_PROVIDER_TESTNET, toMinimalDenom } from "@/lib/chain";

export function useStaking() {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<DelegationResponse[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatorsLoading, setIsValidatorsLoading] = useState(false);
  const [isDelegationsLoading, setIsDelegationsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();

  const fetchValidators = useCallback(async () => {
    if (!queryClient) return;

    setIsValidatorsLoading(true);
    try {
      const response = await queryClient.staking.validators("BOND_STATUS_BONDED");
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
      const response = await queryClient.staking.delegatorDelegations(address);
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
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to delegate.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        if (!validatorAddress) {
          throw new Error("Please select a validator.");
        }

        const amountInMinimalDenom = toMinimalDenom(amount);
        if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
          throw new Error("Invalid amount. Please enter a valid positive number.");
        }

        const delegateMsg: MsgDelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
          value: MsgDelegate.fromPartial({
            delegatorAddress: address,
            validatorAddress,
            amount: coin(amountInMinimalDenom, ICS_PROVIDER_TESTNET.denom),
          }),
        };

        const result = await signingClient.signAndBroadcast(
          address,
          [delegateMsg],
          "auto",
          "Delegation via Para + CosmJS"
        );

        setTxHash(result.transactionHash);

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
    setError(null);
  }, []);

  return {
    delegate,
    validators,
    delegations,
    txHash,
    isLoading,
    isValidatorsLoading,
    isDelegationsLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
