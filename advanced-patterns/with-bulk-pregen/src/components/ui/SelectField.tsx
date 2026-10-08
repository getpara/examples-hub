import { useId, type ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/classNames";

export interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<ComponentPropsWithoutRef<"select">, "children"> {
  label: string;
  options: ReadonlyArray<SelectFieldOption>;
  hint?: string;
}

export function SelectField({ label, options, hint, id, className, disabled, ...selectProps }: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  return (
    <div className={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
      <label htmlFor={selectId} className="truncate text-label tracking-ui">
        {label}
      </label>
      <div className="relative flex min-h-control-md items-stretch border border-border-strong bg-surface transition-[border-color,box-shadow] duration-200 ease-brand focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)] motion-reduce:transition-none">
        <select
          id={selectId}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-10 pl-3 text-body text-foreground outline-none disabled:cursor-not-allowed"
          {...selectProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="caret-down" className="pointer-events-none absolute top-1/2 right-3 size-icon-sm -translate-y-1/2 text-muted" />
      </div>
      {hint && (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
