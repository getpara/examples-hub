import { useId, type ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/classNames";

interface TextAreaFieldProps extends ComponentPropsWithoutRef<"textarea"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({ label, hint, error, id, className, disabled, rows = 3, ...textAreaProps }: TextAreaFieldProps) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const messageId = `${textAreaId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
      <label htmlFor={textAreaId} className="text-label tracking-ui">
        {label}
      </label>
      <textarea
        id={textAreaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cx(
          "min-h-[88px] w-full resize-none border bg-surface px-3 py-2 text-body text-foreground caret-accent outline-none [overflow-wrap:anywhere] transition-[border-color,box-shadow] duration-200 ease-brand placeholder:text-muted disabled:cursor-not-allowed motion-reduce:transition-none",
          error
            ? "border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]"
            : "border-border-strong focus:border-foreground focus:shadow-[inset_0_-2px_0_var(--color-accent)]"
        )}
        {...textAreaProps}
      />
      {message && (
        <p id={messageId} className={cx("text-caption", error ? "text-destructive" : "text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
