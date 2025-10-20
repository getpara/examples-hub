"use client";

import { useState, useCallback } from "react";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { TransactionHash } from "@/components/ui/TransactionHash";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { TransferForm } from "@/components/ui/TransferForm";
import { useModal } from "@/context/ModalContext";
import { useAccount, useSendTokens, useStargateSigningClient, useActiveChains, useBalance } from "graz";

export default function Home() {
  // Hardcode faucet address for demo
  const faucetAddress = "cosmos1qdvzqujxqd0pqwcdtpxgfcqcvxn777ka3xmn4u";
  const [to, setTo] = useState(faucetAddress);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { openModal } = useModal();
  const { data: account, isConnected } = useAccount();
  const address = account?.bech32Address?.bech32Address || "";

  // Get active chain info
  const activeChains = useActiveChains();
  const activeChain = activeChains?.[0];
  const chainId = activeChain?.chainId || "provider";
  const currencies = activeChain?.currencies || [];
  const chainDenom = currencies?.[0]?.coinMinimalDenom || "uatom";
  const chainDecimals = currencies?.[0]?.coinDecimals || 6;
  const displayDenom = currencies?.[0]?.coinDenom || "ATOM";

  // Get balance hook for refetching
  const { refetch: refetchBalance } = useBalance({
    chainId,
    denom: chainDenom,
    bech32Address: address,
  });

  // Graz hooks for sending tokens
  const { sendTokensAsync } = useSendTokens();
  const { data: signingClients } = useStargateSigningClient();
  const signingClient = signingClients?.[chainId] || null;

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    refetchBalance();
  }, [refetchBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signingClient) {
      setError("Signing client not available. Please ensure wallet is connected.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHash(null);

    try {
      // Convert display amount to minimal denom (e.g., ATOM to uatom)
      const amountInMinimalDenom = Math.floor(parseFloat(amount) * 10 ** chainDecimals).toString();

      // Define a fixed fee (adjust based on chain requirements)
      const fee = {
        amount: [{ denom: chainDenom, amount: "5000" }], // 0.005 tokens as fee
        gas: "200000", // Standard gas limit for token transfer
      };

      // Send tokens and wait for transaction to be included (always to faucet)
      const response = await sendTokensAsync({
        signingClient,
        recipientAddress: faucetAddress,
        amount: [{ denom: chainDenom, amount: amountInMinimalDenom }],
        fee,
        memo: `Return ${amount} ${displayDenom} to faucet`,
      });

      const txHash = response.transactionHash;
      setHash(txHash);
      console.log("Transaction Hash:", txHash);

      // Clear form on success
      setAmount(""); // Only clear amount, keep faucet address

      // Refresh balance after successful transaction
      setTimeout(() => {
        handleRefresh();
      }, 2000); // Wait 2 seconds for transaction to be processed
    } catch (err) {
      console.error("Transaction failed:", err);
      if (err instanceof Error) {
        setError(err.message || "Transaction failed. Please try again.");
      } else {
        setError("Transaction failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Graz Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send Cosmos with your connected wallet using Graz. This demonstrates using Para as a wallet connector
          alongside other wallet options in a custom modal.
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <BalanceCard
            key={refreshKey}
            address={address}
            onRefresh={handleRefresh}
          />
          <TransferForm
            to={to}
            amount={amount}
            isLoading={isLoading}
            denom={displayDenom}
            onToChange={setTo}
            onAmountChange={setAmount}
            onSubmit={handleSubmit}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-none">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <TransactionHash txHash={hash || ""} />
        </div>
      )}
    </div>
  );
}
