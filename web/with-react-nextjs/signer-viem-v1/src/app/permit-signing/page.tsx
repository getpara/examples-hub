"use client";

import { useState, useEffect } from "react";
import { formatEther, getContract, maxUint256 } from "viem";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useViemProvider } from "@/hooks/useViemProvider";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS, PARA_TEST_TOKEN_CONTRACT_OWNER } from "@/config/contracts";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

export default function PermitSigningPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [currentAllowance, setCurrentAllowance] = useState<string | null>(null);
  const [permitStatus, setPermitStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const [signedPermit, setSignedPermit] = useState<{
    deadline: string;
    v: number;
    r: string;
    s: string;
  } | null>(null);

  const { data: account } = useAccount();
  const { walletClient } = useParaSigner();
  const publicClient = useViemProvider();
  const address = useAccountAddress();

  const fetchTokenData = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));

      const allowance = await contract.read.allowance([address, PARA_TEST_TOKEN_CONTRACT_OWNER]);
      setCurrentAllowance(formatEther(allowance as bigint));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
      setCurrentAllowance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address]);

  const signPermit = async () => {
    setIsLoading(true);
    setPermitStatus({ show: false, type: "success", message: "" });
    setSignedPermit(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to sign the permit.");
      }

      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      // Get nonce for the permit
      const nonce = await contract.read.nonces([address]);

      // Set deadline to 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      // Create the permit message
      const domain = {
        name: (await contract.read.name()) as string,
        version: "1",
        chainId: 17000,
        verifyingContract: PARA_TEST_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
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

      const message = {
        owner: address,
        spender: PARA_TEST_TOKEN_CONTRACT_OWNER as `0x${string}`,
        value: maxUint256,
        nonce: nonce as bigint,
        deadline,
      };

      setPermitStatus({
        show: true,
        type: "info",
        message: "Please sign the permit in your wallet...",
      });

      const signature = await walletClient!.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "Permit",
        message,
      });

      // Split signature
      const sig = signature.slice(2);
      const r = `0x${sig.substring(0, 64)}`;
      const s = `0x${sig.substring(64, 128)}`;
      const v = parseInt(sig.substring(128, 130), 16);

      setSignedPermit({
        deadline: deadline.toString(),
        v,
        r,
        s,
      });

      setPermitStatus({
        show: true,
        type: "success",
        message: "Permit signed successfully! The signature can be used to approve token spending without a transaction.",
      });

      // Refresh allowance after signing
      await fetchTokenData();
    } catch (error) {
      console.error("Error signing permit:", error);
      setPermitStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to sign permit. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Permit Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign a permit to allow token spending without requiring a separate approval transaction. This implements
          EIP-2612 for gasless approvals.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Token Information:</h3>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh data">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Your PTT Balance:</span>
              <span className="text-sm font-medium text-gray-900">
                {!address
                  ? "Connect wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} PTT`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-700">Current Allowance to Owner:</span>
              <span className="text-sm font-medium text-gray-900">
                {!address
                  ? "Connect wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : currentAllowance
                  ? `${parseFloat(currentAllowance).toFixed(4)} PTT`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-none border border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Permit Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Spender:</span>{" "}
                <span className="font-mono text-xs break-all">{PARA_TEST_TOKEN_CONTRACT_OWNER}</span>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span> <span className="font-medium">Unlimited</span>
              </div>
              <div>
                <span className="text-gray-600">Validity:</span> <span className="font-medium">1 hour</span>
              </div>
            </div>
          </div>
        </div>

        {permitStatus.show && (
          <div
            className={`mb-4 rounded-none border ${
              permitStatus.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : permitStatus.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{permitStatus.message}</p>
          </div>
        )}

        <button
          onClick={signPermit}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !account?.isConnected}>
          {isLoading ? "Signing Permit..." : "Sign Permit"}
        </button>

        {signedPermit && (
          <div className="mt-8 rounded-none border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Signed Permit Data:</h3>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Deadline:</p>
                <p className="text-sm font-mono bg-white p-2 border border-gray-200 break-all">
                  {signedPermit.deadline} ({new Date(parseInt(signedPermit.deadline) * 1000).toLocaleString()})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">V:</p>
                <p className="text-sm font-mono bg-white p-2 border border-gray-200">{signedPermit.v}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">R:</p>
                <p className="text-sm font-mono bg-white p-2 border border-gray-200 break-all">{signedPermit.r}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">S:</p>
                <p className="text-sm font-mono bg-white p-2 border border-gray-200 break-all">{signedPermit.s}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}