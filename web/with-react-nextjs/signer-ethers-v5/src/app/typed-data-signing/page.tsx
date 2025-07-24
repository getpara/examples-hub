"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useWallet } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { useParaSigner } from "@/hooks/useParaSigner";
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

const PARA_TEST_TOKEN_CONTRACT_ADDRESS = "0x83cC70475A0d71EF1F2F61FeDE625c8C7E90C3f2";

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

  const account = useAccount();
  const { data: wallet } = useWallet();
  const { signer, provider } = useParaSigner();

  const fetchTokenData = async () => {
    if (!wallet?.address || !provider) return;

    setIsBalanceLoading(true);
    try {
      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, provider);

      const balance = await contract.balanceOf(wallet.address);
      setTokenBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Error fetching token data:", error);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (wallet?.address) {
      fetchTokenData();
    }
  }, [wallet?.address]);

  const signAttestation = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setSignature(null);
    setAttestation(null);

    if (!signer || !provider || !wallet?.address) return;

    try {
      if (!account?.isConnected) {
        throw new Error("Please connect your wallet.");
      }

      if (!tokenBalance) {
        throw new Error("Unable to fetch token balance.");
      }

      const contract = new ethers.Contract(PARA_TEST_TOKEN_CONTRACT_ADDRESS, ParaTestToken.abi, provider);

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
        name: name,
        version: "1",
        chainId: 17000, // Holesky
        verifyingContract: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
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
        message: "Please sign the attestation message in your wallet...",
      });

      // Sign the typed data
      const sig = await signer._signTypedData(domain, types, newAttestation);

      setSignature(sig);
      setAttestation(newAttestation);
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Typed Data Signing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create and sign structured attestations about your CTT token holdings. These signatures can be verified
          off-chain by any system that supports{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">EIP-712</code> typed data
          verification.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Token Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!wallet?.address
                ? "Please connect your wallet"
                : isBalanceLoading
                ? "Loading..."
                : tokenBalance
                ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                : "Unable to fetch balance"}
            </p>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !wallet?.address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
        </Card>

        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Attestation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500">
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
            disabled={!account?.isConnected || isLoading || !tokenBalance}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Signing..." : "Sign Attestation"}
          </button>

          {attestation && signature && (
            <div className="space-y-4">
              <Card title="Signed Attestation Data">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Holder:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.holder}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Balance:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">
                      {attestation.balance} CTT
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Purpose:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Timestamp:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">
                      {new Date(attestation.timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nonce:</p>
                    <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{attestation.nonce}</p>
                  </div>
                </div>
              </Card>

              <Card title="Signature">
                <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signature}</p>
              </Card>

              <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
                <p className="mb-2">
                  This signed attestation can be verified off-chain by any system that supports EIP-712. The signature
                  proves:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You are the holder of {attestation.balance} CTT tokens</li>
                  <li>You signed this attestation for {attestation.purpose}</li>
                  <li>The attestation was signed at {new Date(attestation.timestamp * 1000).toLocaleString()}</li>
                  <li>The signature is bound to the Holesky network and CTT contract</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
