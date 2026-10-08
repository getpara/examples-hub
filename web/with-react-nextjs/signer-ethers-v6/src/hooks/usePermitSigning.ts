import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk-lite";
import { useParaSigner } from "@/hooks/useParaSigner";
import { HOLESKY } from "@/lib/chain";
import { PARA_TEST_TOKEN } from "@/lib/contracts";

export type SignedPermit = {
  deadline: string;
  v: number;
  r: string;
  s: string;
};

export function usePermitSigning(
  contractAddress: string = PARA_TEST_TOKEN.address,
  spenderAddress: string = PARA_TEST_TOKEN.owner
) {
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [currentAllowance, setCurrentAllowance] = useState<string | null>(null);
  const [signedPermit, setSignedPermit] = useState<SignedPermit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchTokenData = useCallback(async () => {
    if (!wallet?.address || !provider) return;

    setIsDataLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, PARA_TEST_TOKEN.abi, provider);

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
    setIsLoading(true);
    setError(null);
    setSignedPermit(null);

    try {
      if (!signer || !provider || !wallet?.address) {
        throw new Error("Signer not initialized. Please connect your wallet.");
      }

      const contract = new ethers.Contract(contractAddress, PARA_TEST_TOKEN.abi, provider);

      const nonce = await contract.nonces(wallet.address);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const name = await contract.name();

      const domain = {
        name,
        version: "1",
        chainId: HOLESKY.chainId,
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
