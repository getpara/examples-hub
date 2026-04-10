"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaEthersSigner } from "@getpara/react-sdk/evm";
import { provider } from "@/lib/provider";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

export type SignedPermit = {
  deadline: string;
  v: number;
  r: string;
  s: string;
};

const DEFAULT_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";
const DEFAULT_SPENDER = "0x0f35268de976323e06f5aed6f366b490d9b17750";
const HOLESKY_CHAIN_ID = 17000;

export function usePermitSigning(
  contractAddress: string = DEFAULT_CONTRACT_ADDRESS,
  spenderAddress: string = DEFAULT_SPENDER
) {
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [currentAllowance, setCurrentAllowance] = useState<string | null>(null);
  const [signedPermit, setSignedPermit] = useState<SignedPermit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { ethersSigner: signer } = useParaEthersSigner({ provider });

  const fetchTokenData = useCallback(async () => {
    if (!wallet?.address || !provider) return;

    setIsDataLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);

      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.formatEther(balance));

      const allowance = await contract.allowance(wallet.address, spenderAddress);
      setCurrentAllowance(ethers.formatEther(allowance));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
      setCurrentAllowance(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [wallet?.address, provider, contractAddress, spenderAddress]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const signPermit = useCallback(async () => {
    if (!signer || !provider || !wallet?.address) {
      throw new Error("Signer not initialized. Please connect your wallet.");
    }

    setIsLoading(true);
    setError(null);
    setSignedPermit(null);

    try {
      const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);

      const nonce = await contract.nonces(wallet.address);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const name = await contract.name();

      const domain = {
        name,
        version: "1",
        chainId: HOLESKY_CHAIN_ID,
        verifyingContract: contractAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        owner: wallet.address,
        spender: spenderAddress,
        value: ethers.MaxUint256,
        nonce,
        deadline,
      };

      const signature = await signer.signTypedData(domain, types, value);

      // Split signature into v, r, s components
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);
      const v = parseInt(signature.slice(130, 132), 16);

      const permit: SignedPermit = {
        deadline: deadline.toString(),
        v,
        r,
        s,
      };

      setSignedPermit(permit);
      await fetchTokenData();

      return permit;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to sign permit");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signer, provider, wallet?.address, contractAddress, spenderAddress, fetchTokenData]);

  const reset = useCallback(() => {
    setSignedPermit(null);
    setError(null);
  }, []);

  return {
    signPermit,
    fetchTokenData,
    tokenBalance,
    currentAllowance,
    signedPermit,
    isLoading,
    isDataLoading,
    isReady: !!signer && !!provider && !!wallet?.address,
    error,
    reset,
  };
}
