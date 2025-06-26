"use client";
import { useState } from "react";
import { useAccount, useModal, useWallet } from "@getpara/react-sdk";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { TransactionHash } from "@/components/ui/TransactionHash";
import { ConnectWalletCard } from "@/components/ui/ConnectWalletCard";
import { TransferForm } from "@/components/ui/TransferForm";
import { useBalance } from "@/hooks/useBalance";
import { useServerTransaction } from "@/hooks/useServerTransaction";
import { isValidEthereumAddress, isValidAmount } from "@/utils/validation";

export default function Home() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const { openModal } = useModal();
  const { data: account } = useAccount();
  const { data: wallet } = useWallet();

  const address = wallet?.address;
  const walletId = wallet?.id;
  const isConnected = account?.isConnected;

  // Use custom hooks
  const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance(address);
  const { sendTransactionAsync, isLoading, isError, isSuccess, error, data: transactionData } = useServerTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isConnected) {
        throw new Error("Please connect your wallet to send a transaction.");
      }

      if (!walletId || !address) {
        throw new Error("No wallet ID found. Please reconnect your wallet.");
      }

      if (!isValidEthereumAddress(to)) {
        throw new Error("Invalid recipient address format.");
      }

      if (!isValidAmount(amount)) {
        throw new Error("Please enter a valid amount greater than 0.");
      }

      await sendTransactionAsync({
        from: address,
        to,
        amount,
        walletId,
      });

      // Reset form on success
      setTo("");
      setAmount("");
    } catch (error) {
      // Error will be handled by React Query
      console.error("Transaction error:", error);
    }
  };

  // Derive status from React Query state
  const status = {
    show: isLoading || isError || isSuccess,
    type: isLoading ? ("info" as const) : isError ? ("error" as const) : ("success" as const),
    message: isLoading
      ? "Submitting transaction to server for signing..."
      : isError
      ? error?.message || "Failed to send transaction. Please try again."
      : "Transaction submitted and confirmed successfully!",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Para Signing Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Send ETH with your connected wallet using server-side signing. This demonstrates using the Para SDK with
          ethers.js integration to construct transactions client-side and sign them server-side.
        </p>
      </div>

      {!isConnected ? (
        <ConnectWalletCard onConnect={() => openModal()} />
      ) : (
        <div className="max-w-xl mx-auto">
          <BalanceCard
            balance={balance ?? null}
            isLoading={isBalanceLoading}
            onRefresh={() => refetchBalance()}
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

          <TransactionHash txHash={transactionData?.transactionHash || ""} />
        </div>
      )}
    </div>
  );
}
