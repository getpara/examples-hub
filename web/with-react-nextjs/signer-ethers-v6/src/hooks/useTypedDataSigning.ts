"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk-lite";
import { useParaSigner } from "./useParaSigner";
import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";

export type TokenAttestation = {
  holder: string;
  balance: string;
  purpose: string;
  timestamp: number;
  nonce: number;
};

const DEFAULT_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";
const HOLESKY_CHAIN_ID = 17000;

export function useTypedDataSigning(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<TokenAttestation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchTokenData = useCallback(async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);
      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [wallet?.address, provider, contractAddress]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const signAttestation = useCallback(
    async (purpose: string) => {
      if (!signer || !provider || !wallet?.address) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      if (!tokenBalance) {
        throw new Error("Unable to fetch token balance.");
      }

      setIsLoading(true);
      setError(null);
      setSignature(null);
      setAttestation(null);

      try {
        const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);
        const name = await contract.name();
        const nonce = await contract.nonces(wallet.address);

        // Create the attestation data
        const newAttestation: TokenAttestation = {
          holder: wallet.address,
          balance: tokenBalance,
          purpose,
          timestamp: Math.floor(Date.now() / 1000),
          nonce: Number(nonce),
        };

        // Define the typed data structure
        const domain = {
          name,
          version: "1",
          chainId: HOLESKY_CHAIN_ID,
          verifyingContract: contractAddress,
        };

        const types = {
          TokenAttestation: [
            { name: "holder", type: "address" },
            { name: "balance", type: "string" },
            { name: "purpose", type: "string" },
            { name: "timestamp", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        };

        const sig = await signer.signTypedData(domain, types, newAttestation);

        setSignature(sig);
        setAttestation(newAttestation);

        return { signature: sig, attestation: newAttestation };
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to sign attestation");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, provider, wallet?.address, tokenBalance, contractAddress]
  );

  const reset = useCallback(() => {
    setSignature(null);
    setAttestation(null);
    setError(null);
  }, []);

  return {
    signAttestation,
    fetchTokenData,
    tokenBalance,
    signature,
    attestation,
    isLoading,
    isBalanceLoading,
    isReady: !!signer && !!provider && !!wallet?.address && !!tokenBalance,
    error,
    reset,
  };
}
