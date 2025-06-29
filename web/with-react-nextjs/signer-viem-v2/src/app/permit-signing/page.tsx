"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS, PARA_TEST_TOKEN_CONTRACT_OWNER } from "@/config/contracts";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther, getContract, maxUint256 } from "viem";

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

  const { isConnected, address, walletClient, publicClient, walletId } = useParaSigner();
  const { openModal } = useModal();

  const fetchTokenData = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: ParaTestToken.abi,
        client: publicClient!,
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
        client: publicClient!,
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

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Wallet Connection Required</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to view this demo.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Permit Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an EIP-2612 permit that allows the contract owner to spend your tokens without requiring a separate
          approval transaction. This enables gasless token transfers.
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
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Holesky</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Token Balance:</span>{" "}
                <span className="text-gray-600">
                  {!address
                    ? "N/A"
                    : isBalanceLoading
                    ? "Loading..."
                    : tokenBalance
                    ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                    : "0 CTT"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Current Allowance:</span>{" "}
                <span className="text-gray-600">
                  {!address
                    ? "N/A"
                    : isBalanceLoading
                    ? "Loading..."
                    : currentAllowance
                    ? `${parseFloat(currentAllowance).toFixed(4)} CTT`
                    : "0 CTT"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-none border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Spender Address (Contract Owner):</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
              {PARA_TEST_TOKEN_CONTRACT_OWNER}
            </p>
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
          disabled={!isConnected || isLoading}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Signing Permit..." : "Sign Unlimited Permit"}
        </button>

        {signedPermit && (
          <div className="mt-8 space-y-6">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signed Permit Data:</h3>
              </div>
              <div className="p-6 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Deadline:</span>{" "}
                  <span className="text-gray-600">
                    {new Date(parseInt(signedPermit.deadline) * 1000).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">v:</span>{" "}
                  <span className="font-mono text-gray-600">{signedPermit.v}</span>
                </p>
                <p className="text-sm break-all">
                  <span className="font-medium text-gray-700">r:</span>{" "}
                  <span className="font-mono text-gray-600">{signedPermit.r}</span>
                </p>
                <p className="text-sm break-all">
                  <span className="font-medium text-gray-700">s:</span>{" "}
                  <span className="font-mono text-gray-600">{signedPermit.s}</span>
                </p>
              </div>
            </div>

            <div className="rounded-none border border-yellow-200 bg-yellow-50">
              <div className="p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This permit signature can be used by the contract owner to call the{" "}
                  <code className="font-mono text-xs bg-yellow-100 px-1 py-0.5 rounded">permit()</code> function on the
                  token contract, which will approve them to spend your tokens without requiring a transaction from you.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}