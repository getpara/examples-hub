"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther, maxUint256, parseSignature, type Address, type Hex } from "viem";
import { PARA_TEST_TOKEN_ABI, PARA_TEST_TOKEN_ADDRESS } from "@/lib/contracts";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

interface SignedPermit {
  owner: Address;
  spender: Address;
  value: string;
  deadline: string;
  v: number;
  r: Hex;
  s: Hex;
  signature: Hex;
}

const permitTypes = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export function usePermitSigning() {
  const { viemClient, account, address, isReady } = useParaSigner();
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [currentAllowance, setCurrentAllowance] = useState<string | null>(null);
  const [signedPermit, setSignedPermit] = useState<SignedPermit | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const reset = () => {
    setSignedPermit(null);
    setError(null);
  };

  const fetchTokenData = useCallback(async () => {
    if (!address) {
      setTokenBalance(null);
      setCurrentAllowance(null);
      return;
    }

    try {
      setIsDataLoading(true);
      setError(null);
      const owner = (await publicClient.readContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        functionName: "owner",
      })) as Address;

      const [balance, allowance] = await Promise.all([
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "allowance",
          args: [address, owner],
        }),
      ]);

      setTokenBalance(formatEther(balance as bigint));
      setCurrentAllowance(formatEther(allowance as bigint));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch permit data"));
    } finally {
      setIsDataLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReady) {
      void fetchTokenData();
    }
  }, [isReady, fetchTokenData]);

  const signPermit = async () => {
    if (!viemClient || !account || !address) {
      setError(new Error("Connect your Para wallet before signing a permit."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [spender, nonce, tokenName] = await Promise.all([
        publicClient.readContract({
          address: PARA_TEST_TOKEN_ADDRESS,
          abi: PARA_TEST_TOKEN_ABI,
          functionName: "owner",
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

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 60);
      const signature = await viemClient.signTypedData({
        account,
        domain: {
          name: tokenName as string,
          version: "1",
          chainId: CHAIN.id,
          verifyingContract: PARA_TEST_TOKEN_ADDRESS,
        },
        types: permitTypes,
        primaryType: "Permit",
        message: {
          owner: address,
          spender: spender as Address,
          value: maxUint256,
          nonce: nonce as bigint,
          deadline,
        },
      });

      const parsed = parseSignature(signature);
      setSignedPermit({
        owner: address,
        spender: spender as Address,
        value: maxUint256.toString(),
        deadline: deadline.toString(),
        v: Number(parsed.v ?? BigInt(27)),
        r: parsed.r,
        s: parsed.s,
        signature,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign permit"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signPermit,
    fetchTokenData,
    tokenBalance,
    currentAllowance,
    signedPermit,
    isLoading,
    isDataLoading,
    isReady,
    error,
    reset,
  };
}
