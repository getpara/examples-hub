"use client";

import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TablePagination } from "@/components/ui/TablePagination";
import { WalletResultTable } from "@/components/ui/WalletResultTable";
import type { useBulkPregenWallets } from "@/hooks/useBulkPregenWallets";
import { pluralizeWallets, toWalletResultRows } from "@/lib/bulkPregenDisplay";
import { downloadCsv } from "@/lib/download";
import { getResultsFileName, toResultsCsv } from "@/lib/handleCsv";
import { PAGE_SIZE_OPTIONS, usePagination } from "@/lib/usePagination";

interface WalletResultsContainerProps {
  bulk: ReturnType<typeof useBulkPregenWallets>;
  onStartNewBatch: () => void;
}

export function WalletResultsContainer({ bulk, onStartNewBatch }: WalletResultsContainerProps) {
  const pagination = usePagination(bulk.results);
  const isProcessing = bulk.stage === "processing";

  return (
    <ActionPanel
      title="Results"
      api="POST /api/wallet/generate"
      description="Each row is one request to your server. Download the results to keep the handle to address mapping."
      hint={isProcessing ? `Creating ${bulk.progress.completed} of ${bulk.progress.total}.` : undefined}
      actions={
        <>
          {bulk.summary.failed > 0 && (
            <Button
              size="lg"
              isLoading={isProcessing}
              onClick={() => void bulk.retryFailed()}
              data-testid="bulk-retry-button">
              {`Retry ${pluralizeWallets(bulk.summary.failed)}`}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            disabled={isProcessing}
            onClick={() => downloadCsv(getResultsFileName(), toResultsCsv(bulk.results))}
            data-testid="bulk-export-button">
            Download results CSV
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={isProcessing}
            icon={<Icon name="refresh" className="size-icon-md" />}
            onClick={onStartNewBatch}
            data-testid="bulk-reset-button">
            Start new batch
          </Button>
        </>
      }>
      <WalletResultTable
        caption="Pregen wallet results"
        rows={toWalletResultRows(pagination.pageItems, pagination.startIndex)}
      />
      <TablePagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        firstItem={bulk.results.length === 0 ? 0 : pagination.startIndex + 1}
        lastItem={pagination.endIndex}
        totalItems={bulk.results.length}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </ActionPanel>
  );
}
