"use client";

import { useModal, useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useState, useEffect } from "react";
import { PARA_TEST_TOKEN_CONTRACT_ADDRESS } from "@/config/contracts";
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

  const { isConnected, address, publicClient, walletClient } = useParaSigner();
  const { openModal } = useModal();

  const fetchTokenData = async () => {
    if (!address || !publicClient) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
        abi: ParaTestToken.abi,
        client: publicClient!,
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
        client: publicClient!,
      });

      const name = await contract.read.name();
      const nonce = await contract.read.nonces([address]);

      const newAttestation: TokenAttestation = {
        holder: address!,
        balance: tokenBalance,
        purpose,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Number(nonce),
      };

      const domain = {
        name: name as string,
        version: "1",
        chainId: publicClient!.chain!.id,
        verifyingContract: PARA_TEST_TOKEN_CONTRACT_ADDRESS,
      } as const;

      const types = {
        TokenAttestation: [
          { name: "holder", type: "address" },
          { name: "balance", type: "string" },
          { name: "purpose", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      } as const;

      setStatus({
        show: true,
        type: "info",
        message: "Please sign the typed data in your wallet...",
      });

      const messageToSign = {
        holder: address as `0x${string}`,
        balance: tokenBalance,
        purpose: purpose,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        nonce: nonce as bigint,
      };

      const sig = await walletClient!.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "TokenAttestation",
        message: messageToSign,
      });

      setSignature(sig);
      setAttestation(newAttestation);

      setStatus({
        show: true,
        type: "success",
        message: "Typed data signed successfully!",
      });
    } catch (error) {
      console.error("Error signing typed data:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to sign typed data. Please try again.",
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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Typed Data Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign structured data using EIP-712. This example creates a token holder attestation with your current CTT
          balance, which can be used for off-chain verification of token ownership.
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
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signAttestation();
          }}
          className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Attestation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              disabled={isLoading}
              className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500">
              {ATTESTATION_PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              Select the purpose for this attestation. This will be included in the signed data.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isConnected || isLoading || !tokenBalance}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? "Signing..." : "Sign Token Attestation"}
          </button>
        </form>

        {signature && attestation && (
          <div className="mt-8 space-y-6">
            <div className="rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Signed Attestation Data:</h3>
              </div>
              <div className="p-6 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Holder:</span>{" "}
                  <span className="font-mono text-gray-600">{attestation.holder}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Balance:</span>{" "}
                  <span className="text-gray-600">{attestation.balance} CTT</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Purpose:</span>{" "}
                  <span className="text-gray-600">{attestation.purpose}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Timestamp:</span>{" "}
                  <span className="text-gray-600">{new Date(attestation.timestamp * 1000).toLocaleString()}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Nonce:</span>{" "}
                  <span className="text-gray-600">{attestation.nonce}</span>
                </p>
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
  );
}