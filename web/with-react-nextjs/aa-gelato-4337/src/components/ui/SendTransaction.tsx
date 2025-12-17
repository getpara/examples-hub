import { ExternalLink } from "lucide-react";
import type { Hash } from "viem";

interface SendTransactionProps {
  onSend: () => void;
  isPending: boolean;
  error: Error | null;
  txHash: Hash | null;
  isReady: boolean;
}

export function SendTransaction({ onSend, isPending, error, txHash, isReady }: SendTransactionProps) {
  const showStatus = isPending || !!error || !!txHash;

  const statusConfig = isPending
    ? { bg: "bg-gray-100 border-gray-300", text: "text-gray-700", message: "Sending sponsored transaction..." }
    : error
      ? {
          bg: "bg-gray-200 border-gray-400",
          text: "text-gray-900",
          message: error.message || "Transaction failed. Please try again.",
        }
      : {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-800",
          message: "Transaction sent successfully!",
        };

  return (
    <>
      {showStatus && (
        <div className={`mb-4 p-4 rounded-none border ${statusConfig.bg}`}>
          <p className={`text-sm break-words ${statusConfig.text}`}>{statusConfig.message}</p>
        </div>
      )}

      <div className="bg-white rounded-none border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-medium mb-4">Send Sponsored Transaction</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-none">
            <p className="text-sm text-gray-600 mb-1">Transaction type:</p>
            <p className="text-lg font-mono font-semibold">Gas-Sponsored UserOperation</p>
            <p className="text-sm text-gray-500 mt-2">
              This sends a zero-value transaction to demonstrate EIP-4337 gas sponsorship via Gelato&apos;s relay.
            </p>
          </div>
          <button
            onClick={onSend}
            disabled={isPending || !isReady}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-none hover:bg-gray-950 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
            {isPending ? "Sending..." : "Send Sponsored Transaction"}
          </button>
        </div>
      </div>

      {txHash && (
        <div className="bg-white rounded-none border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-2">Transaction Hash</h3>
          <div className="bg-gray-50 p-4 rounded-none border border-gray-200 break-all">
            <code className="text-sm text-gray-800 font-mono">{txHash}</code>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            View on Etherscan <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </>
  );
}
