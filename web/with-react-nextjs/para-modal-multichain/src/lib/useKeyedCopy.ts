import { useCallback, useState } from "react";
import { useCopyToClipboard, type CopyStatus } from "@/lib/useCopyToClipboard";

export function useKeyedCopy<Key extends string>() {
  const { copy, status } = useCopyToClipboard();
  const [copiedKey, setCopiedKey] = useState<Key | null>(null);

  const copyFor = useCallback(
    (key: Key, text: string) => {
      setCopiedKey(key);
      void copy(text);
    },
    [copy]
  );

  const statusFor = useCallback((key: Key): CopyStatus => (key === copiedKey ? status : "idle"), [copiedKey, status]);

  return { copyFor, statusFor };
}
