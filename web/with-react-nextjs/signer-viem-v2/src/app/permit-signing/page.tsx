"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal, useAccount } from "@getpara/react-sdk";
import { useParaViemClient, useParaViemSignTypedData } from "@getpara/react-sdk/evm";
import { formatEther, getContract, maxUint256, http } from "viem";
import { publicClient, CHAIN } from "@/lib/viem";
import { PARA_TEST_TOKEN_ADDRESS, PARA_TEST_TOKEN_ABI } from "@/lib/contracts";
import { StatusAlert } from "@/components/ui/StatusAlert";

const SPENDER_ADDRESS = "0x0f35268de976323e06f5aed6f366b490d9b17750" as const;

export default function PermitSigningPage() {
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [currentAllowance, setCurrentAllowance] = useState<string | null>(null);
  const [status, setStatus] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "success",
    message: "",
  });
  const [signedPermit, setSignedPermit] = useState<{
    deadline: string;
    v: number;
    r: string;
    s: string;
  } | null>(null);

  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useParaViemClient({ walletClientConfig: { chain: CHAIN, transport: http() } });
  const { signTypedDataAsync, isPending, data: signature, error } = useParaViemSignTypedData(viemClient);
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

      const allowance = await contract.read.allowance([address, SPENDER_ADDRESS]);
      setCurrentAllowance(formatEther(allowance as bigint));
    } catch (err) {
      console.error("Error fetching token data:", err);
      setTokenBalance(null);
      setCurrentAllowance(null);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchTokenData();
    }
  }, [address, fetchTokenData]);

  const handleSignPermit = async () => {
    setStatus({ show: false, type: "success", message: "" });
    setSignedPermit(null);

    if (!address) return;

    try {
      const contract = getContract({
        address: PARA_TEST_TOKEN_ADDRESS,
        abi: PARA_TEST_TOKEN_ABI,
        client: publicClient,
      });

      const nonce = (await contract.read.nonces([address])) as bigint;
      const name = (await contract.read.name()) as string;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      setStatus({ show: true, type: "info", message: "Please sign the permit message in your wallet..." });

      await signTypedDataAsync({
        domain: {
          name,
          version: "1",
          chainId: CHAIN.id,
          verifyingContract: PARA_TEST_TOKEN_ADDRESS,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: {
          owner: address,
          spender: SPENDER_ADDRESS,
          value: maxUint256,
          nonce,
          deadline: BigInt(deadline),
        },
      });

      // Split signature into v, r, s components
      if (signature) {
        const r = signature.slice(0, 66);
        const s = "0x" + signature.slice(66, 130);
        const v = parseInt(signature.slice(130, 132), 16);

        setSignedPermit({ deadline: deadline.toString(), v, r, s });
      }

      setStatus({
        show: true,
        type: "success",
        message: "Permit signed successfully! The spender can now use this signature to approve token transfers.",
      });

      await fetchTokenData();
    } catch {
      setStatus({ show: true, type: "error", message: error?.message || "Failed to sign permit." });
    }
  };

  // Update signedPermit when signature changes
  useEffect(() => {
    if (signature && !signedPermit) {
      const r = signature.slice(0, 66);
      const s = "0x" + signature.slice(66, 130);
      const v = parseInt(signature.slice(130, 132), 16);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      setSignedPermit({ deadline: deadline.toString(), v, r, s });
    }
  }, [signature, signedPermit]);

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
        <h1 className="text-4xl font-bold tracking-tight mb-6">Permit Signing Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Sign an EIP-2612 permit using the{" "}
          <code className="font-mono text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded-none">useSignTypedData</code>{" "}
          hook for gasless token approvals.
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
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#x1f504;</span>
            </button>
          </div>
          <div className="px-6 py-3 space-y-2">
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Network: Sepolia</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Token Balance:</span>{" "}
                <span className="text-gray-600">
                  {isBalanceLoading
                    ? "Loading..."
                    : tokenBalance
                      ? `${parseFloat(tokenBalance).toFixed(4)} CTT`
                      : "0 CTT"}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Current Allowance:</span>{" "}
                <span className="text-gray-600">
                  {isBalanceLoading
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
            <h3 className="text-sm font-medium text-gray-900">Spender Address:</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-mono break-all text-gray-600 bg-white p-4 border border-gray-200">
              {SPENDER_ADDRESS}
            </p>
          </div>
        </div>

        {status.show && <StatusAlert type={status.type} message={status.message} />}

        <button
          onClick={handleSignPermit}
          disabled={!isConnected || isPending}
          className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? "Signing Permit..." : "Sign Unlimited Permit"}
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
                  <strong>Note:</strong> This permit signature can be used by the spender to call the{" "}
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
