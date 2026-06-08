"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk-lite";
import { useParaSigner } from "./useParaSigner";
import ParaTestToken from "@/contracts/artifacts/src/contracts/ParaTestToken.sol/ParaTestToken.json";

const DEFAULT_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export function useContractInteraction(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [mintedAmount, setMintedAmount] = useState<string | null>(null);
  const [mintLimit, setMintLimit] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchContractData = useCallback(async () => {
    if (!wallet?.address || !provider) return;

    setIsDataLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, provider);

      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.utils.formatEther(balance));

      const minted = await contract.mintedAmount(wallet.address);
      setMintedAmount(ethers.utils.formatEther(minted));

      const limit = await contract.MINT_LIMIT();
      setMintLimit(ethers.utils.formatEther(limit));
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setTokenBalance(null);
      setMintedAmount(null);
      setMintLimit(null);
    } finally {
      setIsDataLoading(false);
    }
  }, [wallet?.address, provider, contractAddress]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  const mint = useCallback(
    async (amount: string) => {
      if (!signer) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      // Check mint limit
      if (mintedAmount && mintLimit) {
        const currentMinted = parseFloat(mintedAmount);
        const limit = parseFloat(mintLimit);
        if (currentMinted + amountFloat > limit) {
          throw new Error(`Minting ${amountFloat} tokens would exceed your limit of ${limit} tokens.`);
        }
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const contract = new ethers.Contract(contractAddress, ParaTestToken.abi, signer);
        const tx = await contract.mint(ethers.utils.parseEther(amount));
        setTxHash(tx.hash);

        await tx.wait();
        await fetchContractData();

        return tx.hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to mint tokens");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, contractAddress, mintedAmount, mintLimit, fetchContractData]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    mint,
    fetchContractData,
    tokenBalance,
    mintedAmount,
    mintLimit,
    txHash,
    isLoading,
    isDataLoading,
    isReady: !!signer,
    hasReachedLimit: mintedAmount && mintLimit ? parseFloat(mintedAmount) >= parseFloat(mintLimit) : false,
    error,
    reset,
  };
}
