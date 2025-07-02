"use client";

import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  current: number;
  total: number;
}

export function ProcessingStatus({ current, total }: ProcessingStatusProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md flex items-center space-x-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div>
        <p className="font-medium">Creating wallets</p>
        <p className="text-sm text-gray-500">
          Processing {current} of {total}...
        </p>
      </div>
    </div>
  );
}