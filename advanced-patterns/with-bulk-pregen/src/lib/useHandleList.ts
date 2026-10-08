import { useCallback, useState } from "react";
import { parseHandleCsv, validateCsvFile } from "@/lib/handleCsv";
import type { HandleEntry, HandleType } from "@/lib/pregenWalletApi";

interface ImportedFile {
  name: string;
  size: number;
}

const DEFAULT_HANDLE_TYPE: HandleType = "TWITTER";

export function useHandleList() {
  const [entries, setEntries] = useState<HandleEntry[]>([]);
  const [draftHandle, setDraftHandle] = useState("");
  const [draftType, setDraftType] = useState<HandleType>(DEFAULT_HANDLE_TYPE);
  const [importedFile, setImportedFile] = useState<ImportedFile | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);

  const addDraft = useCallback(() => {
    const handle = draftHandle.trim();

    if (!handle) {
      return;
    }

    setEntries((current) => [...current, { handle, type: draftType }]);
    setDraftHandle("");
    setDraftType(DEFAULT_HANDLE_TYPE);
  }, [draftHandle, draftType]);

  const removeEntry = useCallback((index: number) => {
    setEntries((current) => current.filter((_, entryIndex) => entryIndex !== index));
  }, []);

  const importFile = useCallback(async (file: File) => {
    setImportErrorMessage(null);

    const validationError = validateCsvFile(file);

    if (validationError) {
      setImportErrorMessage(validationError);
      return;
    }

    try {
      const { entries: parsedEntries, errorMessage } = parseHandleCsv(await file.text());

      setImportedFile({ name: file.name, size: file.size });

      if (errorMessage) {
        setImportErrorMessage(errorMessage);
        return;
      }

      setEntries(parsedEntries);
    } catch {
      setImportErrorMessage("Failed to read the file.");
    }
  }, []);

  const clearImportedFile = useCallback(() => {
    setImportedFile(null);
    setImportErrorMessage(null);
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    setDraftHandle("");
    setDraftType(DEFAULT_HANDLE_TYPE);
    setImportedFile(null);
    setImportErrorMessage(null);
  }, []);

  return {
    entries,
    draftHandle,
    setDraftHandle,
    draftType,
    setDraftType,
    addDraft,
    removeEntry,
    importedFile,
    importErrorMessage,
    importFile,
    clearImportedFile,
    clear,
  };
}
