<script lang="ts" module>
  export interface SelectFieldOption {
    value: string;
    label: string;
  }
</script>

<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";
  import Icon from "@/components/ui/Icon.svelte";
  import { cx } from "@/lib/classNames";

  interface Props extends Omit<HTMLSelectAttributes, "children"> {
    label: string;
    options: ReadonlyArray<SelectFieldOption>;
    hint?: string;
    className?: string;
  }

  let { label, options, hint, id, className, disabled, value, ...selectProps }: Props = $props();

  const generatedId = $props.id();
  const selectId = $derived(id ?? generatedId);
  const hintId = $derived(`${selectId}-hint`);
</script>

<div class={cx("grid min-w-0 gap-2", disabled && "opacity-50", className)}>
  <label for={selectId} class="truncate text-label tracking-ui">{label}</label>
  <div
    class="relative flex min-h-control-md items-stretch border border-border-strong bg-surface transition-[border-color,box-shadow] duration-200 ease-brand focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_var(--color-accent)] motion-reduce:transition-none">
    <select
      id={selectId}
      {disabled}
      aria-describedby={hint ? hintId : undefined}
      class="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-10 pl-3 text-body text-foreground outline-none disabled:cursor-not-allowed"
      {...selectProps}>
      {#each options as option (option.value)}
        <option value={option.value} selected={option.value === value}>{option.label}</option>
      {/each}
    </select>
    <Icon name="caret-down" className="pointer-events-none absolute top-1/2 right-3 size-icon-sm -translate-y-1/2 text-muted" />
  </div>
  {#if hint}
    <p id={hintId} class="text-caption text-muted">{hint}</p>
  {/if}
</div>
