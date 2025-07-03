"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { FileUpload } from "./file-upload";
import { ResultsTable } from "./results-table";
import { HandleEntryForm } from "./bulk/HandleEntryForm";
import { HandleListTable } from "./bulk/HandleListTable";
import { ProcessingStatus } from "./bulk/ProcessingStatus";
import { ResultsSummary } from "./bulk/ResultsSummary";
import { BulkActions } from "./bulk/BulkActions";
import { useCSVParser } from "@/hooks/use-csv-parser";
import { useHandleManager } from "@/hooks/use-handle-manager";
import { useBatchProcessor } from "@/hooks/use-batch-processor";
import { useBulkResults } from "@/hooks/use-bulk-results";
import { useCSVExport } from "@/hooks/use-csv-export";

export function BulkWalletGenerator() {
  // Hooks
  const { parseCSVFile, downloadTemplate, error: csvError } = useCSVParser();
  const { handleEntries, addHandle, removeHandle, setHandles, clearHandles } = useHandleManager();
  const { status, progress, processBatches, reset: resetProcessor } = useBatchProcessor();
  const { 
    results, 
    summary, 
    initializeResults, 
    updateBatchResults, 
    resetResults, 
    getFailedResults,
    markFailedAsPending,
  } = useBulkResults();
  const { exportToCSV } = useCSVExport();

  // Handle CSV file upload
  const handleFileUpload = async (file: File) => {
    const entries = await parseCSVFile(file);
    if (entries.length > 0) {
      setHandles(entries);
    }
  };

  // Handle form submission for wallet creation
  const handleCreateWallets = async () => {
    if (handleEntries.length === 0) {
      alert("Please add at least one handle");
      return;
    }

    // Initialize results
    initializeResults(handleEntries);

    // Process batches
    await processBatches(handleEntries, (batchResults, batchIndex) => {
      updateBatchResults(batchResults, batchIndex * 5); // Assuming batch size of 5
    });
  };

  // Retry failed wallet creations
  const retryFailedCreations = async () => {
    const failedResults = getFailedResults();
    
    if (failedResults.length === 0) {
      alert("No failed wallet creations to retry");
      return;
    }

    // Mark failed as pending
    markFailedAsPending();

    // Process retries
    const failedEntries = failedResults.map(r => ({ handle: r.handle, type: r.type }));
    await processBatches(failedEntries, (batchResults, batchIndex) => {
      // Update results for retried entries
      batchResults.forEach((result) => {
        const index = results.findIndex(
          (r) => r.handle === result.handle && r.type === result.type
        );
        if (index !== -1) {
          updateBatchResults([result], index);
        }
      });
    });
  };

  // Reset the form
  const handleReset = () => {
    clearHandles();
    resetProcessor();
    resetResults();
  };

  // Export results
  const handleExport = () => {
    exportToCSV(results);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Wallet Generator</CardTitle>
        <CardDescription>Generate wallets for Twitter or Telegram handles</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Section */}
        {status === "idle" && (
          <div className="border rounded-md p-4 space-y-6">
            {/* CSV Upload Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Upload Handles CSV</label>
                <FileUpload onFileUpload={handleFileUpload} />
                {csvError && (
                  <p className="text-sm text-red-500">{csvError}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">CSV format: handle, type (twitter or telegram)</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Manual Entry */}
              <HandleEntryForm onAddHandle={addHandle} />
            </div>

            {/* Handle Entries Table */}
            <HandleListTable entries={handleEntries} onRemove={removeHandle} />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={handleEntries.length === 0}
                onClick={handleCreateWallets}>
                Generate Wallets
              </Button>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {status === "processing" && (
          <ProcessingStatus current={progress.current} total={progress.total} />
        )}

        {/* Results Section */}
        {status === "complete" && results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Results</h2>

            {/* Results Summary */}
            <ResultsSummary successCount={summary.success} failureCount={summary.failed} />

            {/* Results Table */}
            <ResultsTable results={results} />

            {/* Action Buttons */}
            <BulkActions
              onReset={handleReset}
              onExport={handleExport}
              onRetry={retryFailedCreations}
              showRetry={summary.failed > 0}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}