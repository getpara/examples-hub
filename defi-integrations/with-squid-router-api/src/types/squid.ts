export interface ProgressData {
  steps?: Array<{
    items: Array<{
      status: string;
    }>;
  }>;
  currentStep?: {
    id: string;
  };
  txHashes?: Array<{
    txHash: string;
  }>;
  error?: {
    message: string;
  };
  axelarScanUrl?: string;
}

export type StepStatus = "completed" | "active" | "pending" | "failed" | "partial" | "refunded" | "needs_gas" | "timeout";