"use client";

import { useState, useEffect } from "react";
import { formatEther, getContract } from "viem";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useViemProvider } from "@/hooks/useViemProvider";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from "@/config/contracts";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";

type TokenAttestation = {
  holder: string;
  balance: string;
  purpose: string;
  timestamp: number;
  nonce: number;
};

const ATTESTATION_PURPOSES = [
  "Governance Participation",
  "Token Holder Verification",
  "Community Membership",
  "Trading Authorization",
] as const;

export default function TypedDataSigningPage() {
  const [purpose, setPurpose] = useState<(typeof ATTESTATION_PURPOSES)[number]>(ATTESTATION_PURPOSES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<TokenAttestation | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const { data: account } = useAccount();
  const { walletClient } = useParaSigner();
  const publicClient = useViemProvider();
  const address = useAccountAddress();

  const fetchTokenData = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address]);

  const signAttestation = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setSignature(null);
    setAttestation(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet.");
      }

      if (!tokenBalance) {
        throw new Error("Unable to fetch token balance.");
      }

      const nonce = Math.floor(Math.random() * 1000000);
      const timestamp = Math.floor(Date.now() / 1000);

      const attestationData: TokenAttestation = {
        holder: address,
        balance: tokenBalance,
        purpose,
        timestamp,
        nonce,
      };

      const domain = {
        name: "ParaTestToken",
        version: "1",
        chainId: 17000,
        verifyingContract: PARA_TEST_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
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

      setStatus({
        show: true,
        type: "info",
        message: "Please sign the typed data in your wallet...",
      });

      const signature = await walletClient!.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "TokenAttestation",
        message: attestationData,
      });

      setSignature(signature);
      setAttestation(attestationData);

      setStatus({
        show: true,
        type: "success",
        message: "Attestation signed successfully!",
      });
    } catch (error) {
      console.error("Error signing attestation:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to sign attestation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Typed Data Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign structured data using EIP-712. This demo creates and signs a token holder attestation with your current
          PTT balance.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Your PTT Balance:</h3>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Connect wallet"
                : isBalanceLoading
                ? "Loading..."
                : tokenBalance
                ? `${parseFloat(tokenBalance).toFixed(4)} PTT`
                : "N/A"}
            </p>
          </div>
        </div>

        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700">
              Attestation Purpose
            </label>
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none">
              {ATTESTATION_PURPOSES.map((p) => (
                <option
                  key={p}
                  value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={signAttestation}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !account?.isConnected || !tokenBalance}>
            {isLoading ? "Signing Attestation..." : "Sign Attestation"}
          </button>

          {signature && attestation && (
            <div className="mt-8 space-y-4">
              <div className="rounded-none border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Signed Attestation Data:</h3>
                </div>
                <div className="p-6 space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Holder:</span>{" "}
                    <span className="font-mono text-gray-900">{attestation.holder}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Balance:</span>{" "}
                    <span className="font-medium text-gray-900">{attestation.balance} PTT</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Purpose:</span>{" "}
                    <span className="font-medium text-gray-900">{attestation.purpose}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Timestamp:</span>{" "}
                    <span className="font-medium text-gray-900">{new Date(attestation.timestamp * 1000).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Nonce:</span>{" "}
                    <span className="font-medium text-gray-900">{attestation.nonce}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-none border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Signature:</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
                    {signature}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}