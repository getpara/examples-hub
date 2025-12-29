"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk";
import { useParaSigner } from "./useParaSigner";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const DEFAULT_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

export function useTokenTransfer(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("CTT");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchBalances = useCallback(async () => {
    if (!wallet?.address || !provider || !contractAddress) return;

    setIsBalanceLoading(true);
    try {
      // Fetch ETH balance
      const ethBalanceWei = await provider.getBalance(wallet.address);
      setEthBalance(ethers.formatEther(ethBalanceWei));

      // Fetch token balance
      const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(wallet.address);
      const symbol = await tokenContract.symbol();

      setTokenSymbol(symbol);
      setTokenBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching balances:", err);
      setEthBalance(null);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [wallet?.address, provider, contractAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const transfer = useCallback(
    async (to: string, amount: string) => {
      if (!signer) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid recipient address format.");
      }

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
        const tx = await tokenContract.transfer(to, ethers.parseEther(amount));
        setTxHash(tx.hash);

        await tx.wait();
        await fetchBalances();

        return tx.hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to transfer tokens");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, contractAddress, fetchBalances]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    transfer,
    fetchBalances,
    ethBalance,
    tokenBalance,
    tokenSymbol,
    txHash,
    isLoading,
    isBalanceLoading,
    isReady: !!signer,
    error,
    reset,
  };
}
