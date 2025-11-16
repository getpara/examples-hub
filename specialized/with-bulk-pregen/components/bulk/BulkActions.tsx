"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, RotateCw } from "lucide-react";

interface BulkActionsProps {
  onReset: () => void;
  onExport: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function BulkActions({ onReset, onExport, onRetry, showRetry = false }: BulkActionsProps) {
  return (
    <>
      <div className="flex flex-wrap gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start New Batch
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Download Results as CSV
        </Button>
      </div>

      {showRetry && onRetry && (
        <div className="pt-4">
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Retry Failed Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={onRetry}
                className="w-full">
                <RotateCw className="mr-2 h-4 w-4" />
                Retry Failed Creations
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}