import { useId, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/classNames";

const LABEL_CLASS = "text-label tracking-ui";

interface FileDropFieldProps {
  label: string;
  prompt: string;
  hint?: string;
  accept?: string;
  fileName?: string;
  fileDetail?: string;
  error?: string;
  disabled?: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  testId?: string;
}

export function FileDropField({
  label,
  prompt,
  hint,
  accept,
  fileName,
  fileDetail,
  error,
  disabled = false,
  onSelectFile,
  onClearFile,
  testId,
}: FileDropFieldProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      onSelectFile(file);
    }
  };

  return (
    <div className={cx("grid min-w-0 gap-2", disabled && "opacity-50")}>
      {fileName ? <span className={LABEL_CLASS}>{label}</span> : <label htmlFor={inputId} className={LABEL_CLASS}>{label}</label>}
      {fileName ? (
        <div className="flex min-h-control-lg items-center gap-3 border border-border-strong bg-surface py-2 pr-2 pl-4">
          <span className="grid min-w-0 gap-1">
            <span className="truncate font-mono text-code">{fileName}</span>
            {fileDetail && <span className="text-caption text-muted">{fileDetail}</span>}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            disabled={disabled}
            onClick={onClearFile}
            icon={<Icon name="x" className="size-icon-md" />}>
            Remove file
          </Button>
        </div>
      ) : (
        <div className="relative grid min-h-40 place-content-center justify-items-center gap-3 border border-dashed border-border-strong bg-surface p-6 text-center transition-colors duration-200 ease-brand has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring hover:bg-surface-2 motion-reduce:transition-none">
          <span aria-hidden="true" className="pixel-grid size-10" />
          <span className="text-label">{prompt}</span>
          {hint && <span className="text-caption text-muted">{hint}</span>}
          <input
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? messageId : undefined}
            onChange={handleChange}
            data-testid={testId}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </div>
      )}
      {error && (
        <p id={messageId} role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
