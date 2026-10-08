<script lang="ts" module>
  export interface SegmentedControlOption<Value extends string> {
    value: Value;
    label: string;
    testId?: string;
  }
</script>

<script lang="ts" generics="Value extends string">
  import { cx } from "@/lib/classNames";

  interface Props {
    label: string;
    options: ReadonlyArray<SegmentedControlOption<Value>>;
    value: Value;
    onChange: (value: Value) => void;
    disabled?: boolean;
    className?: string;
  }

  const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
  const PREVIOUS_KEYS = ["ArrowLeft", "ArrowUp"];

  let { label, options, value, onChange, disabled = false, className }: Props = $props();

  const selectedIndex = $derived(options.findIndex((option) => option.value === value));

  function moveSelection(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREVIOUS_KEYS.includes(event.key) ? -1 : 0;

    if (step === 0 || disabled || options.length === 0) {
      return;
    }

    event.preventDefault();
    const nextIndex = (Math.max(selectedIndex, 0) + step + options.length) % options.length;
    onChange(options[nextIndex].value);
    const radios = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios[nextIndex]?.focus();
  }
</script>

<div
  role="radiogroup"
  aria-label={label}
  aria-disabled={disabled || undefined}
  onkeydown={moveSelection}
  class={cx("flex border border-border bg-surface text-label tracking-ui", className)}>
  {#each options as option, index (option.value)}
    {@const isSelected = option.value === value}
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabindex={isSelected || (selectedIndex === -1 && index === 0) ? 0 : -1}
      disabled={disabled && !isSelected}
      data-testid={option.testId}
      onclick={() => onChange(option.value)}
      class={cx(
        "focus-ring inline-flex min-h-[calc(var(--spacing-control-md)-2px)] flex-1 items-center justify-center gap-2 px-3 whitespace-nowrap transition-colors duration-200 ease-brand motion-reduce:transition-none",
        index > 0 && "border-l border-border",
        isSelected ? "bg-primary text-on-primary" : "text-muted",
        !isSelected && !disabled && "cursor-pointer hover:text-foreground",
        !isSelected && disabled && "cursor-not-allowed opacity-50"
      )}>
      {option.label}
    </button>
  {/each}
</div>
