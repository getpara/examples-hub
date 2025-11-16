"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface ResultsSummaryProps {
  successCount: number;
  failureCount: number;
}

export function ResultsSummary({ successCount, failureCount }: ResultsSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium mb-2">Process Summary</h3>
      <div className="flex space-x-6">
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <span>{successCount} successful</span>
        </div>
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-500 mr-2" />
          <span>{failureCount} failed</span>
        </div>
      </div>
    </div>
  );
}