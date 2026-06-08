"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther, type Address, type Hex } from "viem";
import { PARA_TEST_TOKEN_ABI, PARA_TEST_TOKEN_ADDRESS } from "@/lib/contracts";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

interface SignedAttestation {
  holder: Address;
  balance: string;
  purpose: string;
  timestamp: number;
  nonce: bigint;
}

const attestationTypes = {
  Attestation: [
    { name: "holder", type: "address" },
    { name: "balance", type: "uint256" },
    { name: "purpose", type: "string" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
} as const;

export function useTypedDataSigning() {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [signature, setSignature] = useState<Hex | null>(null);
  const [attestation, setAttestation] = useState<SignedAttestation | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const reset = () => {
    setSignature(null);
    setAttestation(null);
    setError(null);
  };

  const fetchTokenData = useCallback(async () => {
    if (!address) {
      setTokenBalance(null);
      return;
    }

    try {
      setIsBalanceLoading(true);
      setError(null);
      const balance = await publicClient.readContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setTokenBalance(formatEther(balance as bigint));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch token balance"));
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReady) {
      void fetchTokenData();
    }
  }, [isReady, fetchTokenData]);

  const signAttestation = async (purpose: string) => {
    if (!viemClient || !account || !address) {
      setError(new Error("Connect your Para wallet before signing typed data."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [balance, nonce, tokenName] = await Promise.all([
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "nonces",
          args: [address],
        }),
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "name",
        }),
      ]);

      const balanceWei = balance as bigint;
      const timestamp = BigInt(Math.floor(Date.now() / 1000));
      const nonceValue = nonce as bigint;
      const sig = await viemClient.signTypedData({
        account,
        domain: {
          name: tokenName as string,
          version: "1",
          chainId: CHAIN.id,
          verifyingContract: PARA_TEST_TOKEN_ADDRESS,
        },
        types: attestationTypes,
        primaryType: "Attestation",
        message: {
          holder: address,
          balance: balanceWei,
          purpose,
          timestamp,
          nonce: nonceValue,
        },
      });

      setSignature(sig);
      setAttestation({
        holder: address,
        balance: formatEther(balanceWei),
        purpose,
        timestamp: Number(timestamp),
        nonce: nonceValue,
      });
      setTokenBalance(formatEther(balanceWei));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign typed data"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signAttestation,
    fetchTokenData,
    tokenBalance,
    signature,
    attestation,
    isLoading,
    isBalanceLoading,
    isReady,
    error,
    reset,
  };
}
