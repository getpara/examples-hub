"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { formatEther, getContract } from "viem";
import { useSignTypedData } from "@/hooks/useSignTypedData";
import { publicClient, CHAIN } from "@/lib/viem";
import { PARA_TEST_TOKEN_ADDRESS, PARA_TEST_TOKEN_ABI } from "@/lib/contracts";
import { StatusAlert } from "@/components/ui/StatusAlert";

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
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<TokenAttestation | null>(null);
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { signTypedData, isPending, signature, error } = useSignTypedData();
  const { openModal } = useModal();

  const fetchTokenData = useCallback(async () => {
    if (!address) return;

    setIsBalanceLoading(true);
    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        client: publicClient,
      });

      const balance = await contract.read.balanceOf([address]);
      setTokenBalance(formatEther(balance as bigint));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address, fetchTokenData]);

  const handleSignAttestation = async () => {
    setStatus({ show: false, type: "success", message: "" });
    setAttestation(null);

    if (!tokenBalance || !address) {
      setStatus({ show: true, type: "error", message: "Unable to fetch token balance." });
      return;
    }

    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        client: publicClient,
      });

      const name = (await contract.read.name()) as string;
      const nonce = (await contract.read.nonces([address])) as bigint;
      const timestamp = Math.floor(Date.now() / 1000);

      const newAttestation: TokenAttestation = {
        holder: address,
        balance: tokenBalance,
        purpose,
        timestamp,
        nonce: Number(nonce),
      };

      setStatus({ show: true, type: "info", message: "Please sign the typed data in your wallet..." });

      await signTypedData({
        domain: {
          name,
          version: "1",
          chainId: CHAIN.id,
          verifyingContract: PARA_TEST_TOKEN_ADDRESS,
        },
        types: {
          TokenAttestation: [
            { name: "holder", type: "address" },
            { name: "balance", type: "string" },
            { name: "purpose", type: "string" },
            { name: "timestamp", type: "uint256" },
            { name: "nonce", type: "uint256" },
          ],
        },
        primaryType: "TokenAttestation",
        message: {
          holder: address,
          balance: tokenBalance,
          purpose,
          timestamp: BigInt(timestamp),
          nonce,
        },
      });

      setAttestation(newAttestation);
      setStatus({ show: true, type: "success", message: "Typed data signed successfully!" });
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Failed to sign typed data." });
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
            className="inline-flex items-center justify-center rounded-none bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-950 transition-colors">
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
          Sign structured data using EIP-712 with the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useSignTypedData</code>{" "}
          hook.
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
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <p className="text-lg font-medium text-gray-900">
              {isBalanceLoading
                ? "Loading..."
                : tokenBalance
                  ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                  : "Unable to fetch balance"}
            </p>
          </div>
        </div>

        {status.show && <StatusAlert type={status.type} message={status.message} />}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignAttestation();
          }}
          className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Attestation Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as typeof purpose)}
              disabled={isPending}
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
            disabled={!isConnected || isPending || !tokenBalance}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? "Signing..." : "Sign Token Attestation"}
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
