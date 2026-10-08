import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/classNames";

interface OtpInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "type" | "maxLength" | "aria-label"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  isInvalid?: boolean;
}

export function OtpInput({
  label,
  value,
  onChange,
  length = 6,
  isInvalid = false,
  disabled,
  className,
  ...inputProps
}: OtpInputProps) {
  const cells = Array.from({ length }, (_, index) => value.charAt(index));

  return (
    <div
      className={cx("group relative grid gap-2", disabled && "opacity-50", className)}
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label={label}
        aria-invalid={isInvalid || undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="absolute inset-0 z-10 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
        {...inputProps}
      />
      {cells.map((digit, index) => {
        const isActive = !isInvalid && index === value.length;

        return (
          <span
            key={index}
            aria-hidden="true"
            className={cx(
              "relative flex h-14 items-center justify-center border bg-surface font-mono text-heading tabular-nums transition-[border-color,box-shadow] duration-200 ease-brand motion-reduce:transition-none",
              isInvalid
                ? "border-destructive text-destructive"
                : digit
                  ? "border-foreground text-foreground"
                  : "border-border-strong text-foreground",
              isActive && "group-focus-within:border-foreground group-focus-within:shadow-[inset_0_-2px_0_var(--color-accent)]"
            )}>
            {digit}
            {isActive && <span className="absolute hidden h-6 w-0.5 bg-accent group-focus-within:block" />}
          </span>
        );
      })}
    </div>
  );
}
