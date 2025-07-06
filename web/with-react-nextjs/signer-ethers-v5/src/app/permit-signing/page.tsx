"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";
const PARA_TEST_TOKEN_CONTRACT_OWNER = "0x0f35268de976323e06f5aed6f366b490d9b17750";

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

  const account = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchTokenData = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, provider);

      // Get token balance
      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.utils.formatEther(balance));

      // Get current allowance
      const allowance = await contract.allowance(wallet.address, PARA_TEST_TOKEN_CONTRACT_OWNER);
      setCurrentAllowance(ethers.utils.formatEther(allowance));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
      setCurrentAllowance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address) {
      fetchTokenData();
    }
  }, [wallet?.address]);

  const signPermit = async () => {
    setIsLoading(true);
    setPermitStatus({ show: false, type: "success", message: "" });
    setSignedPermit(null);

    if (!signer || !provider || !wallet?.address) return;

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet to sign the permit.");
      }

      if (!wallet?.id) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, provider);

      // Get the current nonce for the owner
      const nonce = await contract.nonces(wallet.address);

      // Calculate deadline (1 hour from now)
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      // Get domain separator
      const domainSeparator = await contract.DOMAIN_SEPARATOR();
      const name = await contract.name();

      // Prepare permit data
      const domain = {
        name: name,
        version: "1",
        chainId: 17000, // Holesky
        verifyingContract: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
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
        spender: PARA_TEST_TOKEN_CONTRACT_OWNER,
        value: ethers.constants.MaxUint256,
        nonce: nonce,
        deadline: deadline,
      };

      setPermitStatus({
        show: true,
        type: "info",
        message: "Please sign the permit message in your wallet...",
      });

      // Sign the permit
      const signature = await signer._signTypedData(domain, types, value);

      // Split signature into v, r, s components
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Permit Signing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an ERC20 permit to allow the contract owner to transfer your CTT tokens. This demonstrates the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">ERC20Permit</code>{" "}
          functionality.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Information">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Your CTT Balance:</p>
                <p className="text-lg font-medium text-gray-900">
                  {!wallet?.address
                    ? "Please connect your wallet"
                    : isBalanceLoading
                    ? "Loading..."
                    : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "Unable to fetch balance"}
                </p>
              </div>
              <button
                onClick={fetchTokenData}
                disabled={isBalanceLoading || !wallet?.address}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                title="Refresh data">
                <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Owner Allowance:</p>
              <p className="text-lg font-medium text-gray-900">
                {!wallet?.address
                  ? "Please connect your wallet"
                  : isBalanceLoading
                  ? "Loading..."
                  : currentAllowance
                  ? `${parseFloat(currentAllowance).toFixed(4)} CTT`
                  : "Unable to fetch allowance"}
              </p>
            </div>
          </div>
        </Card>

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
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          disabled={!account?.isConnected || isLoading}>
          {isLoading ? "Signing Permit..." : "Sign Permit"}
        </button>

        {signedPermit && (
          <div className="space-y-4">
            <Card title="Signed Permit Data">
              <div className="space-y-4">
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
            </Card>

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
