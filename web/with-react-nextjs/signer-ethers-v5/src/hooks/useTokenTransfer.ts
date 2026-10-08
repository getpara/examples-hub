import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk-lite";
import { ERC20_ABI, PARA_TEST_TOKEN } from "@/lib/contracts";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useTokenTransfer(contractAddress: string = PARA_TEST_TOKEN.address) {
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>(PARA_TEST_TOKEN.symbol);
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
      const ethBalanceWei = await provider.getBalance(wallet.address);
      setEthBalance(ethers.utils.formatEther(ethBalanceWei));

      const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(wallet.address);
      const symbol = await tokenContract.symbol();

      setTokenSymbol(symbol);
      setTokenBalance(ethers.utils.formatEther(balance));
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
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
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

        const tokenContract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
        const tx = await tokenContract.transfer(to, ethers.utils.parseEther(amount));
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
