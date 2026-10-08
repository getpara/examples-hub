import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";

interface FundingPromptProps {
  title: string;
  message: string;
  action: ReactNode;
}

export function FundingPrompt({ title, message, action }: FundingPromptProps) {
  return (
    <div className="grid justify-items-start gap-3">
      <Alert title={title} className="justify-self-stretch">
        {message}
      </Alert>
      {action}
    </div>
  );
}
