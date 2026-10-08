import { useCallback, useState } from "react";

const CODE_LENGTH = 6;

export function useMfaCodeEntry() {
  const [code, setCodeValue] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [isBackupCode, setIsBackupCode] = useState(false);

  const setCode = useCallback(
    (value: string) => setCodeValue(isBackupCode ? value : value.replace(/\D/g, "").slice(0, CODE_LENGTH)),
    [isBackupCode]
  );

  const toggleBackupCode = useCallback(() => {
    setIsBackupCode((current) => !current);
    setCodeValue("");
    setSubmittedCode(null);
  }, []);

  const trimmedCode = code.trim();
  const canSubmit = isBackupCode ? trimmedCode.length > 0 : trimmedCode.length === CODE_LENGTH;

  const markSubmitted = useCallback(() => setSubmittedCode(trimmedCode), [trimmedCode]);

  return {
    code,
    trimmedCode,
    codeLength: CODE_LENGTH,
    setCode,
    isBackupCode,
    toggleBackupCode,
    canSubmit,
    markSubmitted,
    isSubmittedCode: submittedCode === trimmedCode,
  };
}
