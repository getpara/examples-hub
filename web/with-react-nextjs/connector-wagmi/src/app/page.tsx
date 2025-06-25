"use client";

import { useState } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import "@getpara/react-sdk/styles.css";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TransactionHash } from "@/components/ui/TransactionHash";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { TransferForm } from "@/components/ui/TransferForm";
import { useModal } from "@/context/ModalContext";

export default function Home() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const { address } = useAccount();
  const {
    sendTransaction,
    data: hash,
    isPending: isSending,
    isError: isSendError,
    error: sendError,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to send a transaction.");
      }

      if (!isAddress(to)) {
        throw new Error("Invalid recipient address format.");
      }

      const parsedAmount = parseEther(amount);
      if (parsedAmount <= 0n) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      sendTransaction({
        to: to as `0x${string}`,
        value: parsedAmount,
      });

      // Reset form on successful submission
      if (!isSendError && !isConfirmError) {
        setTo("");
        setAmount("");
      }
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  // Derive status from transaction state
  const isLoading = isSending || isConfirming;
  const isError = isSendError || isConfirmError;
  const error = sendError || confirmError;

  const status = {
    show: isLoading || isError || isConfirmed,
    type: isLoading ? ("info" as const) : isError ? ("error" as const) : ("success" as const),
    message: isSending
      ? "Submitting transaction..."
      : isConfirming
      ? "Waiting for confirmation..."
      : isError
      ? error?.message || "Failed to send transaction. Please try again."
      : "Transaction confirmed successfully!",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para + Wagmi Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send ETH with your connected wallet using Wagmi. This demonstrates using Para as a wallet connector alongside
          other wallet options in a custom modal.
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={openModal} />
      ) : (
        <div className="max-w-xl mx-auto">
          <BalanceCard
            address={address}
            onRefresh={() => {}}
          />

          <StatusAlert
            show={status.show}
            type={status.type}
            message={status.message}
          />

          <TransferForm
            to={to}
            amount={amount}
            isLoading={isLoading}
            onToChange={setTo}
            onAmountChange={setAmount}
            onSubmit={handleSubmit}
          />

          <TransactionHash txHash={hash || ""} />
        </div>
      )}
    </div>
  );
}
