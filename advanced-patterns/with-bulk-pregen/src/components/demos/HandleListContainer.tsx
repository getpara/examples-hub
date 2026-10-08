"use client";

import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { FileDropField } from "@/components/ui/FileDropField";
import { HandleTable } from "@/components/ui/HandleTable";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { BATCH_DELAY_MS, BATCH_SIZE } from "@/hooks/useBulkPregenWallets";
import { formatFileSize, pluralizeWallets, toHandleTableRows } from "@/lib/bulkPregenDisplay";
import { downloadCsv } from "@/lib/download";
import { CSV_TEMPLATE, CSV_TEMPLATE_FILE_NAME } from "@/lib/handleCsv";
import { HANDLE_TYPE_OPTIONS, isHandleType } from "@/lib/pregenWalletApi";
import type { useHandleList } from "@/lib/useHandleList";

interface HandleListContainerProps {
  handles: ReturnType<typeof useHandleList>;
  onCreate: () => void;
}

export function HandleListContainer({ handles, onCreate }: HandleListContainerProps) {
  const entryCount = handles.entries.length;

  return (
    <>
      <ActionPanel
        title="Add handles"
        description="Upload a CSV with one handle and type per row, or add handles one at a time. Each handle gets its own EVM wallet that the owner claims later by signing in with that account."
        actions={
          <Button
            variant="outline"
            onClick={() => downloadCsv(CSV_TEMPLATE_FILE_NAME, CSV_TEMPLATE)}
            data-testid="bulk-template-button">
            Download template
          </Button>
        }
        hint="CSV format: handle, type (twitter or telegram). The header row is optional.">
        <FileDropField
          label="Handles CSV"
          prompt="Choose a CSV file or drop it here"
          hint="CSV files only, up to 5 MB"
          accept=".csv,text/csv"
          fileName={handles.importedFile?.name}
          fileDetail={handles.importedFile ? formatFileSize(handles.importedFile.size) : undefined}
          error={handles.importErrorMessage ?? undefined}
          onSelectFile={(file) => void handles.importFile(file)}
          onClearFile={handles.clearImportedFile}
          testId="bulk-csv-input"
        />
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handles.addDraft();
          }}>
          <FieldGroup
            title="Add a handle"
            action={
              <Button type="submit" variant="outline" size="sm" disabled={!handles.draftHandle.trim()} data-testid="bulk-add-handle-button">
                Add
              </Button>
            }>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
              <TextField
                label="Handle"
                placeholder="@username"
                value={handles.draftHandle}
                onChange={(event) => handles.setDraftHandle(event.target.value)}
                data-testid="bulk-handle-input"
              />
              <SelectField
                label="Type"
                value={handles.draftType}
                options={HANDLE_TYPE_OPTIONS}
                onChange={(event) => isHandleType(event.target.value) && handles.setDraftType(event.target.value)}
                data-testid="bulk-handle-type-select"
              />
            </div>
          </FieldGroup>
        </form>
        {entryCount > 0 && (
          <HandleTable caption="Handles to create" rows={toHandleTableRows(handles.entries)} onRemove={handles.removeEntry} />
        )}
      </ActionPanel>
      <ActionPanel
        title="Create pregen wallets"
        api={'createPregenWallet({ type: "EVM", pregenId })'}
        description="Your server creates one wallet per handle, using the X username or Telegram user ID as the pregen identifier."
        hint={`Requests run in batches of ${BATCH_SIZE} with a ${BATCH_DELAY_MS / 1000} second pause between batches.`}
        actions={
          <Button size="lg" disabled={entryCount === 0} onClick={onCreate} data-testid="bulk-create-button">
            {entryCount > 0 ? `Create ${pluralizeWallets(entryCount)}` : "Create wallets"}
          </Button>
        }
      />
    </>
  );
}
