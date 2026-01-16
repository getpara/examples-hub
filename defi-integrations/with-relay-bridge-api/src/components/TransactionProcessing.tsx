import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { AlertCircle } from "lucide-react";
import { SupportedNetwork } from "@/config/constants";

interface Network {
  name: string;
}

interface Asset {
  symbol: string;
}

type TransactionState = "idle" | "sending" | "checking" | "complete" | "failed";
type StepType = "approve" | "deposit" | "fill" | "complete" | "failed";

interface TransactionProcessingProps {
  amount: string;
  asset: Asset;
  originNetwork: Network | undefined;
  destNetwork: Network | undefined;
  transactionHash: string;
  currentStep: StepType;
  transactionState: TransactionState;
  onReset: () => void;
  errorMessage?: string;
  originNetworkKey?: SupportedNetwork; // Add this to identify the network
}

// Helper function to get explorer URL based on network
const getExplorerUrl = (network: SupportedNetwork, txHash: string): string => {
  switch (network) {
    case "ethereum":
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case "base":
      return `https://sepolia.basescan.org/tx/${txHash}`;
    case "solana":
      return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    default:
      return "#";
  }
};

// Helper function to format transaction hash display
const formatTxHash = (txHash: string, network: SupportedNetwork): string => {
  // Solana transaction hashes are longer, so we might want to show less characters
  const issolana = network === "solana";
  const prefixLength = issolana ? 8 : 10;
  return `${txHash.substring(0, prefixLength)}...`;
};

export function TransactionProcessing({
  amount,
  asset,
  originNetwork,
  destNetwork,
  transactionHash,
  currentStep,
  transactionState,
  onReset,
  errorMessage,
  originNetworkKey,
}: TransactionProcessingProps) {
  // Determine which steps to show based on the quote
  const steps = [
    { id: "deposit", label: "Deposit", description: "Sending funds to bridge" },
    { id: "fill", label: "Bridge", description: "Processing cross-chain transfer" },
    { id: "complete", label: "Complete", description: "Transaction confirmed" },
  ];

  // Add approve step if needed (you might want to pass this info from the quote)
  const needsApproval = asset.symbol !== "ETH" && originNetworkKey !== "solana"; // Solana doesn't need approve
  if (needsApproval && currentStep === "approve") {
    steps.unshift({ id: "approve", label: "Approve", description: "Approving token spend" });
  }

  const explorerUrl = originNetworkKey && transactionHash ? getExplorerUrl(originNetworkKey, transactionHash) : "#";

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <Card className="w-full shadow-xl rounded-2xl overflow-hidden border-0 bg-white">
        <CardHeader className="pb-4 pt-8 px-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Transaction Processing</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="font-semibold text-gray-900">
                {amount} {asset.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Route</span>
              <span className="font-medium text-gray-900">
                {originNetwork?.name} → {destNetwork?.name}
              </span>
            </div>
            {transactionHash && originNetworkKey && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transaction</span>
                <a
                  href={explorerUrl}
                  className="text-sm font-mono text-blue-600 hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer">
                  {formatTxHash(transactionHash, originNetworkKey)}
                </a>
              </div>
            )}
          </div>

          <div className="py-4">
            <StepIndicator
              currentStep={currentStep}
              steps={steps}
            />
          </div>

          <div className="text-center space-y-2">
            {transactionState === "complete" ? (
              <>
                <div className="text-green-600 font-semibold">Transaction Completed Successfully!</div>
                <div className="text-sm text-gray-600">
                  Your {asset.symbol} has been bridged to {destNetwork?.name}
                </div>
              </>
            ) : transactionState === "failed" ? (
              <>
                <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  Transaction Failed
                </div>
                {errorMessage && <div className="text-sm text-gray-600">{errorMessage}</div>}
                <div className="text-sm text-gray-500">Please try again or contact support if the issue persists.</div>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Please wait while we process your transaction. This may take a few minutes.
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pb-6 pt-2 px-6">
          {(transactionState === "complete" || transactionState === "failed") && (
            <Button
              className="w-full h-14 text-base font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              onClick={onReset}>
              {transactionState === "complete" ? "Bridge More Assets" : "Try Again"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
