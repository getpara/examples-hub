import { useCallback, useState } from "react";
import type { Operation } from "@/hooks/useBatchTransactions";

const EMPTY_OPERATION: Operation = { type: "mint", recipient: "", amount: "" };

export const OPERATION_TYPES: ReadonlyArray<{ value: Operation["type"]; label: string }> = [
  { value: "mint", label: "Mint" },
  { value: "transfer", label: "Transfer" },
];

function isOperationType(value: string): value is Operation["type"] {
  return OPERATION_TYPES.some((option) => option.value === value);
}

export function useBatchOperations() {
  const [operations, setOperations] = useState<Operation[]>([EMPTY_OPERATION]);

  const add = useCallback(() => {
    setOperations((current) => [...current, EMPTY_OPERATION]);
  }, []);

  const remove = useCallback((index: number) => {
    setOperations((current) => current.filter((_, position) => position !== index));
  }, []);

  const setType = useCallback((index: number, type: string) => {
    if (!isOperationType(type)) {
      return;
    }

    setOperations((current) =>
      current.map((operation, position) => (position === index ? { ...EMPTY_OPERATION, type } : operation))
    );
  }, []);

  const setField = useCallback((index: number, field: "recipient" | "amount", value: string) => {
    setOperations((current) =>
      current.map((operation, position) => (position === index ? { ...operation, [field]: value } : operation))
    );
  }, []);

  const clear = useCallback(() => {
    setOperations([EMPTY_OPERATION]);
  }, []);

  const isComplete = operations.every(
    (operation) => operation.amount && (operation.type !== "transfer" || operation.recipient)
  );

  return { operations, add, remove, setType, setField, clear, isComplete };
}
