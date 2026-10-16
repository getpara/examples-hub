import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "@/lib/classNames";

interface TextFieldProps extends Omit<ComponentPropsWithoutRef<"input">, "prefix"> {
  label: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  trailing?: ReactNode;
}

export function TextField({ label, hint, error, prefix, trailing, id, className, disabled, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
      <label htmlFor={inputId} className="truncate text-label tracking-ui">
        {label}
      </label>
      <div
        className={cx(
          "flex min-h-control-lg items-stretch border bg-surface transition-[border-color,box-shadow] duration-200 ease-brand motion-reduce:transition-none",
          error
            ? "border-destructive shadow-[inset_0_-2px_0_var(--color-destructive)]"
            : "border-border-strong focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)]"
        )}>
        {prefix && (
          <span className="flex flex-none items-center gap-1 border-r border-border pr-3 pl-4 text-body font-medium">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-body text-foreground caret-accent outline-none placeholder:text-muted disabled:cursor-not-allowed"
          {...inputProps}
        />
        {trailing && <span className="flex flex-none items-center pr-4 text-caption text-muted">{trailing}</span>}
      </div>
      {message && (
        <p id={messageId} className={cx("text-caption", error ? "text-destructive" : "text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
