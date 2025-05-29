import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { AlertCircle } from "lucide-react";

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
}: TransactionProcessingProps) {
  // Determine which steps to show based on the quote
  const steps = [
    { id: "deposit", label: "Deposit", description: "Sending funds to bridge" },
    { id: "fill", label: "Bridge", description: "Processing cross-chain transfer" },
    { id: "complete", label: "Complete", description: "Transaction confirmed" },
  ];

  // Add approve step if needed (you might want to pass this info from the quote)
  const needsApproval = asset.symbol !== "ETH"; // Example logic
  if (needsApproval && currentStep === "approve") {
    steps.unshift({ id: "approve", label: "Approve", description: "Approving token spend" });
  }

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
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
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
