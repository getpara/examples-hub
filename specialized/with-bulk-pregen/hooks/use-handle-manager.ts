import { useState, useCallback } from "react";
import { HandleEntry, HandleType } from "./use-csv-parser";

export function useHandleManager() {
  const [handleEntries, setHandleEntries] = useState<HandleEntry[]>([]);

  const addHandle = useCallback((handle: string, type: HandleType) => {
    if (!handle.trim()) {
      return false;
    }

    setHandleEntries((prev) => [...prev, { handle: handle.trim(), type }]);
    return true;
  }, []);

  const removeHandle = useCallback((index: number) => {
    setHandleEntries((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const setHandles = useCallback((handles: HandleEntry[]) => {
    setHandleEntries(handles);
  }, []);

  const clearHandles = useCallback(() => {
    setHandleEntries([]);
  }, []);

  const addHandlesFromCSV = useCallback((csvHandles: HandleEntry[]) => {
    setHandleEntries((prev) => [...prev, ...csvHandles]);
  }, []);

  return {
    handleEntries,
    addHandle,
    removeHandle,
    setHandles,
    clearHandles,
    addHandlesFromCSV,
  };
}