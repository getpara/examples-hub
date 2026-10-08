import type { KeyboardEvent } from "react";
import { cx } from "@/lib/classNames";

export interface SegmentedControlOption<Value extends string> {
  value: Value;
  label: string;
  testId?: string;
}

interface SegmentedControlProps<Value extends string> {
  label: string;
  options: ReadonlyArray<SegmentedControlOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  className?: string;
}

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];

export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedControlProps<Value>) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  const moveSelection = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREVIOUS_KEYS.includes(event.key) ? -1 : 0;

    if (step === 0 || disabled || options.length === 0) {
      return;
    }

    event.preventDefault();
    const nextIndex = (Math.max(selectedIndex, 0) + step + options.length) % options.length;
    onChange(options[nextIndex].value);
    const radios = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onKeyDown={moveSelection}
      className={cx("flex border border-border bg-surface text-label tracking-ui", className)}>
      {options.map((option, index) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected || (selectedIndex === -1 && index === 0) ? 0 : -1}
            disabled={disabled && !isSelected}
            data-testid={option.testId}
            onClick={() => onChange(option.value)}
            className={cx(
              "focus-ring inline-flex min-h-[calc(var(--spacing-control-md)-2px)] flex-1 items-center justify-center gap-2 px-3 whitespace-nowrap transition-colors duration-200 ease-brand motion-reduce:transition-none",
              index > 0 && "border-l border-border",
              isSelected ? "bg-primary text-on-primary" : "text-muted",
              !isSelected && !disabled && "cursor-pointer hover:text-foreground",
              !isSelected && disabled && "cursor-not-allowed opacity-50"
            )}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
