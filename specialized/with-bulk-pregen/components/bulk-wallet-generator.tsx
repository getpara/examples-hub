"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, RefreshCw, CheckCircle, XCircle, Trash2, FileText, Plus, RotateCw } from "lucide-react";
import { ResultsTable } from "./results-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "./file-upload";
import { Input } from "@/components/ui/input";

// Types for our wallet generation process
type ProcessingStatus = "idle" | "processing" | "complete";
type HandleType = "TWITTER" | "TELEGRAM";

type HandleEntry = {
  handle: string;
  type: HandleType;
};

type WalletResult = {
  handle: string;
  type: HandleType;
  walletAddress: string;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
};

export function BulkWalletGenerator() {
  // State for form inputs
  const [handleEntries, setHandleEntries] = useState<HandleEntry[]>([]);
  const [newHandle, setNewHandle] = useState("");
  const [newType, setNewType] = useState<HandleType>("TWITTER");

  // State for processing
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [results, setResults] = useState<WalletResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Handle CSV file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      parseCSV(csvText);
    };
    reader.readAsText(file);
  };

  // Parse CSV content
  const parseCSV = (csvText: string) => {
    // Split by lines and remove empty lines
    const lines = csvText.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      alert("The CSV file is empty");
      return;
    }

    // Check if there's a header row
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("handle") && (firstLine.includes("type") || firstLine.includes("platform"));

    // Start from index 1 if there's a header, otherwise from 0
    const startIndex = hasHeader ? 1 : 0;

    const entries: HandleEntry[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",").map((part) => part.trim());

      if (parts.length >= 2) {
        const handle = parts[0];
        const typeStr = parts[1].toLowerCase();

        const type: HandleType = typeStr === "telegram" ? "TELEGRAM" : "TWITTER";

        entries.push({ handle, type });
      }
    }

    if (entries.length === 0) {
      alert("No valid entries found in the CSV file");
      return;
    }

    setHandleEntries(entries);
  };

  // Add a new handle entry manually
  const addHandleEntry = () => {
    if (!newHandle.trim()) {
      alert("Please enter a handle");
      return;
    }

    setHandleEntries([...handleEntries, { handle: newHandle, type: newType }]);
    setNewHandle("");
    setNewType("TWITTER");
  };

  // Remove a handle entry
  const removeHandleEntry = (index: number) => {
    const updatedEntries = [...handleEntries];
    updatedEntries.splice(index, 1);
    setHandleEntries(updatedEntries);
  };

  // Handle form submission for wallet creation
  const handleCreateWallets = async () => {
    // Validate inputs
    if (handleEntries.length === 0) {
      alert("Please add at least one handle");
      return;
    }

    // Start processing
    setStatus("processing");

    // Initialize results with pending status
    const initialResults = handleEntries.map((entry) => ({
      handle: entry.handle,
      type: entry.type,
      walletAddress: "",
      status: "pending" as const,
      errorMessage: undefined,
    }));

    setResults(initialResults);
    setProgress({ current: 0, total: handleEntries.length });

    // Process handles in batches
    const batchSize = 5; // Adjust batch size as needed based on API limits/performance
    const processedResults: WalletResult[] = [...initialResults];

    for (let i = 0; i < handleEntries.length; i += batchSize) {
      const batch = handleEntries.slice(i, i + batchSize);
      const batchIndices = Array.from({ length: batch.length }, (_, idx) => i + idx);

      // *** Call the updated processCreateBatch with actual API calls ***
      const batchResults = await processCreateBatch(batch);

      // Update results state based on the API responses
      batchIndices.forEach((globalIndex, batchIndex) => {
        // Make sure batchResults[batchIndex] exists before assigning
        if (batchResults[batchIndex]) {
          processedResults[globalIndex] = batchResults[batchIndex];
        } else {
          // Handle potential mismatch or error, maybe mark as failed
          console.error(`Mismatch in batch results at index ${batchIndex} for global index ${globalIndex}`);
          processedResults[globalIndex] = {
            ...processedResults[globalIndex], // keep handle/type
            status: "failed",
            errorMessage: "Batch processing error: result mismatch",
          };
        }
      });

      // Update progress and results state for UI feedback
      setProgress({ current: Math.min(i + batchSize, handleEntries.length), total: handleEntries.length });
      setResults([...processedResults]); // Create a new array reference to trigger re-render

      // Optional: Small delay between batches to avoid overwhelming the API
      // Remove this if your API can handle rapid requests or if batchSize is small
      if (i + batchSize < handleEntries.length) {
        console.log(`Processed batch ${i / batchSize + 1}, pausing briefly...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
      }
    }

    // Complete processing
    console.log("All batches processed.");
    setStatus("complete");
  };

  // Process a batch of handles by calling the backend API
  const processCreateBatch = async (batchHandles: HandleEntry[]): Promise<WalletResult[]> => {
    console.log(
      `Processing batch of ${batchHandles.length} handles:`,
      batchHandles.map((h) => h.handle)
    );

    // Create an array of promises, one for each API call in the batch
    const apiCallPromises = batchHandles.map(async (entry) => {
      try {
        const response = await fetch("/api/wallet/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send the specific handle and type for this entry
          body: JSON.stringify({
            handle: entry.handle,
            type: entry.type,
          }),
        });

        // Handle HTTP errors (e.g., 500 Internal Server Error, 400 Bad Request)
        if (!response.ok) {
          let errorMsg = `API request failed with status ${response.status}`;
          try {
            // Try to parse specific error message from API response body
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (parseError) {
            // Ignore if response body is not valid JSON or empty
            console.warn("Could not parse error response body:", parseError);
          }
          throw new Error(errorMsg); // Throw error to be caught below
        }

        // Parse the successful JSON response
        const data = await response.json();

        // Check the 'success' flag from the API response
        if (data.success && data.wallet?.address) {
          // Successfully created wallet
          return {
            handle: entry.handle, // Return original handle/type
            type: entry.type,
            walletAddress: data.wallet.address, // Get address from response
            status: "success" as const,
          };
        } else {
          // API returned success: false or missing wallet data
          throw new Error(data.error || "API returned unsuccessful status or missing data");
        }
      } catch (error) {
        // Handle fetch errors (network issues) or errors thrown above
        console.error(`Failed to process handle ${entry.handle} (${entry.type}):`, error);
        return {
          handle: entry.handle,
          type: entry.type,
          walletAddress: "",
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "An unknown client-side error occurred",
        };
      }
    });

    // Wait for all API calls in the current batch to complete (or fail)
    const results = await Promise.all(apiCallPromises);
    console.log(`Batch processing complete. Results:`, results);
    return results;
  };

  // Retry failed wallet creations
  const retryFailedCreations = async () => {
    const failedCreations = results.filter((r) => r.status === "failed");

    if (failedCreations.length === 0) {
      alert("No failed wallet creations to retry");
      return;
    }

    // Start processing
    setStatus("processing");

    // Update status to pending for wallets being retried
    const updatedResults = results.map((result) => {
      if (result.status === "failed") {
        return {
          ...result,
          status: "pending" as const,
        };
      }
      return result;
    });

    setResults(updatedResults);
    setProgress({ current: 0, total: failedCreations.length });

    // Process retries in batches
    const batchSize = 5;
    const processedResults = [...updatedResults];
    let processedCount = 0;

    for (let i = 0; i < failedCreations.length; i += batchSize) {
      const batch = failedCreations.slice(i, i + batchSize).map((r) => ({ handle: r.handle, type: r.type }));

      // Simulate API call to process creation batch
      const batchResults = await processCreateBatch(batch);

      // Update results
      batchResults.forEach((createResult) => {
        const index = processedResults.findIndex(
          (r) => r.handle === createResult.handle && r.type === createResult.type
        );

        if (index !== -1) {
          processedResults[index] = createResult;
        }
      });

      // Update progress
      processedCount += batch.length;
      setProgress({ current: processedCount, total: failedCreations.length });
      setResults([...processedResults]);

      // Small delay to simulate processing time
      if (i + batchSize < failedCreations.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Complete processing
    setStatus("complete");
  };

  // Reset the form
  const handleReset = () => {
    setHandleEntries([]);
    setStatus("idle");
    setResults([]);
    setProgress({ current: 0, total: 0 });
  };

  // Export results as CSV
  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ["Handle", "Type", "Wallet Address", "Status", "Error"].join(","),
      ...results.map((result) =>
        [result.handle, result.type, result.walletAddress, result.status, result.errorMessage || ""].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wallet-generation-results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const templateContent = "handle,type\n@username1,twitter\n@username2,telegram";
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "handles-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "failed").length;
  const pendingCount = results.filter((r) => r.status === "pending").length;

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
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="text-sm font-medium">Or Add Handles Manually</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="@username"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={newType}
                    onValueChange={(value) => setNewType(value as HandleType)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addHandleEntry}
                    variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Handle Entries Table */}
            {handleEntries.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Handle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {handleEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.handle}</TableCell>
                        <TableCell className="capitalize">{entry.type}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHandleEntry(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

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
          <div className="bg-gray-50 p-4 rounded-md flex items-center space-x-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="font-medium">Creating wallets</p>
              <p className="text-sm text-gray-500">
                Processing {progress.current} of {progress.total}...
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {status === "complete" && results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Results</h2>

            {/* Results Summary */}
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

            {/* Results Table */}
            <ResultsTable results={results} />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Batch
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Download Results as CSV
              </Button>
            </div>

            {/* Retry Actions */}
            {failureCount > 0 && (
              <div className="pt-4">
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Retry Failed Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={retryFailedCreations}
                      className="w-full">
                      <RotateCw className="mr-2 h-4 w-4" />
                      Retry Failed Creations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
