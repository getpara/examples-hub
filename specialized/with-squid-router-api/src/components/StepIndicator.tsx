import { Check, Loader2, Circle, X, AlertCircle, RefreshCw, Clock } from "lucide-react";

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

interface StepIndicatorProps {
  currentStep: StepType;
  steps?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
}

export function StepIndicator({ currentStep, steps: customSteps }: StepIndicatorProps) {
  const defaultSteps = [
    { id: "deposit", label: "Deposit", description: "Sending funds to bridge" },
    { id: "processing", label: "Processing", description: "Validating transaction" },
    { id: "fill", label: "Bridge", description: "Cross-chain transfer" },
    { id: "complete", label: "Complete", description: "Transaction confirmed" },
  ];

  const steps = customSteps || defaultSteps;

  const getStepStatus = (stepId: string) => {
    if (["failed", "partial", "refunded", "needs_gas", "timeout"].includes(currentStep)) {
      const stepOrder = ["approve", "deposit", "processing", "fill", "complete"];
      const errorStepMapping: Record<string, string> = {
        partial: "fill",
        refunded: "fill",
        needs_gas: "fill",
        timeout: "fill",
        failed: "fill",
      };

      const errorAtStep = errorStepMapping[currentStep] || currentStep;
      const errorIndex = stepOrder.indexOf(errorAtStep);
      const stepIndex = stepOrder.indexOf(stepId);

      if (stepIndex < errorIndex) return "completed";
      if (stepIndex === errorIndex) return currentStep as any; // Return the actual error type
      return "pending";
    }

    if (currentStep === "complete") return "completed";

    const stepOrder = ["approve", "deposit", "processing", "fill", "complete"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5" />;
      case "active":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "failed":
        return <X className="w-5 h-5" />;
      case "partial":
        return <AlertCircle className="w-5 h-5" />;
      case "refunded":
        return <RefreshCw className="w-5 h-5" />;
      case "needs_gas":
        return <AlertCircle className="w-5 h-5" />;
      case "timeout":
        return <Clock className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "active":
        return "bg-blue-600 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "partial":
        return "bg-orange-500 text-white";
      case "refunded":
        return "bg-yellow-500 text-white";
      case "needs_gas":
        return "bg-red-500 text-white";
      case "timeout":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-200 text-gray-400";
    }
  };

  const getLineColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
      case "needs_gas":
        return "bg-red-500";
      case "partial":
        return "bg-orange-500";
      case "refunded":
        return "bg-yellow-500";
      case "timeout":
        return "bg-gray-500";
      default:
        return "bg-gray-200";
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-gray-900";
      case "failed":
      case "needs_gas":
        return "text-red-600";
      case "partial":
        return "text-orange-600";
      case "refunded":
        return "text-yellow-600";
      case "timeout":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getStepColors(
                  status
                )}`}>
                {getStepIcon(status)}
              </div>
              {!isLast && <div className={`w-0.5 h-16 transition-all duration-300 ${getLineColor(status)}`} />}
            </div>

            <div className="flex-1 pb-8">
              <h3 className={`font-semibold transition-colors duration-300 ${getTextColor(status)}`}>{step.label}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {status === "partial" && step.id === "fill"
                  ? "Partially completed - check destination wallet"
                  : status === "refunded" && step.id === "fill"
                  ? "Transaction refunded"
                  : status === "needs_gas" && step.id === "fill"
                  ? "Needs additional gas"
                  : status === "timeout" && step.id === "fill"
                  ? "Transaction timed out"
                  : status === "failed" && step.id === "fill"
                  ? "Transaction failed"
                  : step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
