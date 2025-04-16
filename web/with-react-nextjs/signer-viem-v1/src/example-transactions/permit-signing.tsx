"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS, PARA_TEST_TOKEN_CONTRACT_OWNER } from ".";

import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther, getContract, maxUint256 } from "viem";

export default function PermitSigningDemo() {
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

  const { isConnected, walletId, address, walletClient, publicClient } = usePara();

  const fetchTokenData = async () => {
    if (!address) return;

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
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet to sign the permit.");
      }

      if (!walletId) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const nonce = await contract.read.nonces([address]);

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const domainSeparator = await contract.read.DOMAIN_SEPARATOR();

      const name = await contract.read.name();

      const domain = {
        name: name as string,
        version: "1",
        chainId: 17000, // Holesky
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

      const value = {
        owner: address,
        spender: PARA_TEST_TOKEN_CONTRACT_OWNER,
        value: maxUint256,
        nonce,
        deadline,
      };

      setPermitStatus({
        show: true,
        type: "info",
        message: "Please sign the permit message in your wallet...",
      });

      // Sign the permit with viem's signTypedData
      const signature = await walletClient!.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "Permit",
        message: value,
      });

      // Split signature into v, r, s components
      // In viem, we can get r, s, v using tools provided
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);
      const v = parseInt(signature.slice(130, 132), 16);

      setSignedPermit({
        deadline: deadline.toString(),
        v,
        r,
        s,
      });

      setPermitStatus({
        show: true,
        type: "success",
        message:
          "Permit signed successfully! The contract owner can now use this signature to approve token transfers.",
      });

      // Refresh token data
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
          Sign an ERC20 permit to allow the contract owner to transfer your CTT tokens. This demonstrates the{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">ERC20Permit</code>{" "}
          functionality.
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
            <div>
              <p className="text-sm text-gray-600">Your CTT Balance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                  : "Unable to fetch balance"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Owner Allowance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : currentAllowance
                  ? `${parseFloat(currentAllowance).toFixed(4)} CTT`
                  : "Unable to fetch allowance"}
              </p>
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
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
            <p className="px-6 py-4 break-words">{permitStatus.message}</p>
          </div>
        )}

        <button
          onClick={signPermit}
          className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          disabled={!isConnected || isLoading}>
          {isLoading ? "Signing Permit..." : "Sign Permit"}
        </button>

        {signedPermit && (
          <div className="space-y-4">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signed Permit Data:</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Deadline:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.deadline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">v:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.v}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">r:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.r}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">s:</p>
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signedPermit.s}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
              <p>
                The contract owner can now use these permit values to approve token transfers on your behalf. The permit
                is valid for 1 hour from the time of signing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
