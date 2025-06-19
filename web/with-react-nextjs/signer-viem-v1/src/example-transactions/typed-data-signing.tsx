"use client";

import { usePara } from "@/components/ParaProvider";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from ".";
import ParaTestToken from "@/contracts/artifacts/contracts/ParaTestToken.sol/ParaTestToken.json";
import { formatEther, getContract } from "viem";

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

export default function TypedDataSigningDemo() {
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

  const { isConnected, address, publicClient, walletClient } = usePara();

  const fetchTokenData = async () => {
    if (!address) return;

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
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet.");
      }

      if (!tokenBalance) {
        throw new Error("Unable to fetch token balance.");
      }

      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        publicClient: publicClient!,
      });

      const name = await contract.read.name();
      const nonce = await contract.read.nonces([address]);

      const newAttestation: TokenAttestation = {
        holder: address,
        balance: tokenBalance,
        purpose,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Number(nonce),
      };

      const domain = {
        name: name as string,
        version: "1",
        chainId: 17000, // Holesky
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
        message: "Please sign the attestation message in your wallet...",
      });

      // Sign the typed data
      const sig = await walletClient!.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "TokenAttestation",
        message: newAttestation,
      });

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
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Typed Data Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create and sign structured attestations about your CTT token holdings. These signatures can be verified
          off-chain by any system that supports{" "}
          <code className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md">EIP-712</code> typed data
          verification.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Token Balance:</h3>
            <button
              onClick={fetchTokenData}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>🔄</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Holesky</p>
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
        </div>

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
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
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
            disabled={!isConnected || isLoading || !tokenBalance}
            className="w-full rounded-none bg-blue-900 px-6 py-3 text-sm font-medium text-white hover:bg-blue-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Signing..." : "Sign Attestation"}
          </button>

          {attestation && signature && (
            <div className="space-y-4">
              <div className="rounded-none border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Signed Attestation Data:</h3>
                </div>
                <div className="p-6 space-y-4">
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
              </div>

              <div className="rounded-none border border-gray-200">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Signature:</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-2">{signature}</p>
                </div>
              </div>

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
