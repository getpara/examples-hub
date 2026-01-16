import { Check, Loader2, Circle, X } from "lucide-react";

interface StepIndicatorProps {
  currentStep: "approve" | "deposit" | "fill" | "complete" | "failed";
  steps?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
}

export function StepIndicator({ currentStep, steps: customSteps }: StepIndicatorProps) {
  const defaultSteps = [
    { id: "approve", label: "Approve", description: "Approving token spend" },
    { id: "deposit", label: "Deposit", description: "Sending funds to bridge" },
    { id: "fill", label: "Bridge", description: "Processing cross-chain transfer" },
    { id: "complete", label: "Complete", description: "Transaction confirmed" },
  ];

  const steps = customSteps || defaultSteps;

  const getStepStatus = (stepId: string) => {
    if (currentStep === "failed") return stepId === currentStep ? "failed" : "pending";
    if (currentStep === "complete") return "completed";

    const stepOrder = ["approve", "deposit", "fill", "complete"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  status === "completed"
                    ? "bg-green-500 text-white"
                    : status === "active"
                    ? "bg-blue-600 text-white"
                    : status === "failed"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}>
                {status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : status === "active" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === "failed" ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-16 transition-all duration-300 ${
                    status === "completed" ? "bg-green-500" : status === "failed" ? "bg-red-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-8">
              <h3
                className={`font-semibold transition-colors duration-300 ${
                  status === "active" ? "text-gray-900" : status === "failed" ? "text-red-600" : "text-gray-600"
                }`}>
                {step.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
