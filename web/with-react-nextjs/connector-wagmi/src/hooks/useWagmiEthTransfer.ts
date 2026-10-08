import { parseEther, type Address } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";

interface EthTransfer {
  to: Address;
  amount: string;
}

export function useWagmiEthTransfer() {
  const { data: hash, error: sendError, isPending: isSending, sendTransaction } = useSendTransaction();
  const { error: confirmError, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId: sepolia.id,
  });

  const send = ({ to, amount }: EthTransfer) => {
    sendTransaction({
      chainId: sepolia.id,
      to,
      value: parseEther(amount),
    });
  };

  const error = sendError ?? confirmError;

  return {
    send,
    hash,
    isSending,
    isConfirming,
    isConfirmed,
    errorMessage: error ? ("shortMessage" in error ? error.shortMessage : error.message) : null,
  };
}
