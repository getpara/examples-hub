import { useCallback } from "react";
import { WalletResult } from "./use-batch-processor";

export function useCSVExport() {
  const exportToCSV = useCallback((results: WalletResult[], filename?: string) => {
    // Create CSV content
    const csvContent = [
      ["Handle", "Type", "Wallet Address", "Status", "Error"].join(","),
      ...results.map((result) =>
        [
          result.handle,
          result.type,
          result.walletAddress,
          result.status,
          result.errorMessage || ""
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || `wallet-generation-results-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportToCSV,
  };
}