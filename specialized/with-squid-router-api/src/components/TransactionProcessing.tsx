import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { AlertCircle, ExternalLink } from "lucide-react";

interface Network {
  name: string;
}

interface Asset {
  symbol: string;
}

type TransactionState = "idle" | "sending" | "checking" | "complete" | "failed";
type StepType =
  | "approve"
  | "deposit"
  | "processing"
  | "fill"
  | "complete"
  | "failed"
  | "partial"
  | "refunded"
  | "needs_gas"
  | "timeout";

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
  axelarScanUrl?: string;
}

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
  axelarScanUrl,
}: TransactionProcessingProps) {
  const steps = [
    { id: "deposit", label: "Deposit", description: "Sending funds to bridge" },
    { id: "processing", label: "Processing", description: "Validating transaction" },
    { id: "fill", label: "Bridge", description: "Cross-chain transfer" },
    { id: "complete", label: "Complete", description: "Transaction confirmed" },
  ];

  const getDisplayStep = () => {
    switch (currentStep) {
      case "deposit":
        return "deposit";
      case "processing":
        return "processing";
      case "fill":
        return "fill";
      case "complete":
        return "complete";
      case "partial":
      case "refunded":
      case "needs_gas":
      case "failed":
      case "timeout":
        return "fill"; // Show as stuck at fill step
      default:
        return "deposit";
    }
  };

  const getStatusMessage = () => {
    switch (currentStep) {
      case "partial":
        return {
          title: "Partially Completed",
          message:
            "Funds received on destination chain but final swap may have failed. Please check your destination wallet.",
          type: "warning" as const,
        };
      case "refunded":
        return {
          title: "Transaction Refunded",
          message: "Your funds have been refunded to your wallet. This may take up to 10 minutes to appear.",
          type: "warning" as const,
        };
      case "needs_gas":
        return {
          title: "Additional Gas Required",
          message: "Your transaction needs more gas to complete. Please visit Axelarscan to add gas.",
          type: "error" as const,
        };
      case "timeout":
        return {
          title: "Transaction Timeout",
          message: "The transaction has timed out. Please check the status manually using the transaction hash.",
          type: "error" as const,
        };
      case "failed":
        return {
          title: "Transaction Failed",
          message: errorMessage || "The transaction has failed. Please try again.",
          type: "error" as const,
        };
      case "complete":
        return {
          title: "Transaction Complete!",
          message: `Your ${asset.symbol} has been successfully bridged to ${destNetwork?.name}`,
          type: "success" as const,
        };
      default:
        return {
          title: "Processing Transaction",
          message: "Please wait while we process your transaction. This may take a few minutes.",
          type: "info" as const,
        };
    }
  };

  const status = getStatusMessage();

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
            {transactionHash && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transaction</span>
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  className="text-sm font-mono text-blue-600 hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer">
                  {transactionHash.substring(0, 10)}...
                </a>
              </div>
            )}
          </div>

          <div className="py-4">
            <StepIndicator
              currentStep={getDisplayStep()}
              steps={steps}
            />
          </div>

          <div className="text-center space-y-2">
            <div
              className={`font-semibold ${
                status.type === "success"
                  ? "text-green-600"
                  : status.type === "error"
                  ? "text-red-600"
                  : status.type === "warning"
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}>
              {status.type === "error" && <AlertCircle className="w-5 h-5 inline mr-2" />}
              {status.title}
            </div>
            <div className="text-sm text-gray-600">{status.message}</div>

            {axelarScanUrl && currentStep === "needs_gas" && (
              <a
                href={axelarScanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2">
                Add Gas on Axelarscan
                <ExternalLink className="w-4 h-4" />
              </a>
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
